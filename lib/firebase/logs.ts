import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import {
  Request,
  RequestLog,
  RequestChange,
  TenantType,
  RequestSaveOffer,
} from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';

export const createRequestLog = async (request: Request): Promise<void> => {
  const db = getFirestore();
  const logRef = db.collection('requestsLog').doc(request.logId);

  const logEntry: RequestLog = {
    requestId: request.id,
    changes: [
      {
        field: 'status',
        oldValue: null,
        newValue: 'Pending',
        changedBy: {
          email: request.submittedBy,
          tenantType: 'proxy',
          tenantId: request.proxyTenantId,
        },
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  await logRef.set(logEntry);
};

type ChangeWithoutAuthor = Omit<RequestChange, 'changedBy' | 'updatedAt'>;

export const detectChanges = (
  currentRequest: Request,
  updatedRequest: Partial<Request>,
): ChangeWithoutAuthor[] => {
  const changes: ChangeWithoutAuthor[] = [];
  const compareAndAddChange = (
    field: string,
    oldValue: string | null,
    newValue: string | null,
  ) => {
    if (oldValue !== newValue) {
      changes.push({ field, oldValue, newValue });
    }
  };

  for (const [key, newValue] of Object.entries(updatedRequest)) {
    if (key === 'customerInfo') {
      const currentInfo = currentRequest.customerInfo || {};
      const updatedInfo = newValue as Record<string, string>;

      Object.entries(updatedInfo).forEach(([infoKey, infoValue]) => {
        compareAndAddChange(
          `customerInfo.${infoKey}`,
          currentInfo[infoKey as keyof typeof currentInfo] || null,
          infoValue,
        );
      });
    } else if (key === 'saveOffer') {
      const currentOffer = (currentRequest.saveOffer ||
        {}) as Partial<RequestSaveOffer>;
      const updatedOffer = newValue as unknown as Partial<RequestSaveOffer>;

      if (updatedOffer) {
        const saveOfferFields: (keyof RequestSaveOffer)[] = [
          'id',
          'title',
          'dateOffered',
          'dateAccepted',
          'dateDeclined',
          'dateConfirmed',
        ];

        saveOfferFields.forEach(field => {
          if (field in updatedOffer) {
            compareAndAddChange(
              `saveOffer.${field}`,
              currentOffer[field] ?? null,
              updatedOffer[field] ?? null,
            );
          }
        });
      }
    } else {
      const oldValue =
        (currentRequest[key as keyof Request] as string | null) ?? null;
      const newStringValue = (newValue as string | null) ?? null;
      compareAndAddChange(key, oldValue, newStringValue);
    }
  }

  return changes;
};

export const updateRequestLog = async (
  logId: string,
  changes: ChangeWithoutAuthor[],
  req: NextRequest,
): Promise<void> => {
  const db = getFirestore();
  const logRef = db.collection('requestsLog').doc(logId);

  // Get user info from session cookie
  const sessionCookie = req.cookies.get('session')?.value;
  if (!sessionCookie) {
    throw new Error('Unauthorized: No session cookie found');
  }

  try {
    const decodedClaim = await getAuth().verifySessionCookie(sessionCookie);
    const { email, tenantType, tenantId } = decodedClaim;

    const updatedAt = new Date().toISOString();

    const fullChanges: RequestChange[] = changes.map(change => ({
      ...change,
      changedBy: {
        email: email as string,
        tenantType: tenantType as TenantType,
        tenantId,
      },
      updatedAt,
    }));

    await logRef.update({
      changes: FieldValue.arrayUnion(...fullChanges),
    });
  } catch (error) {
    console.error('Error updating request log:', error);
    throw error;
  }
};
