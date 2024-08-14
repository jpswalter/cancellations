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

  for (const [key, newValue] of Object.entries(updatedRequest)) {
    if (key === 'customerInfo') {
      // Handle customerInfo separately
      const currentCustomerInfo = currentRequest.customerInfo || {};
      const updatedCustomerInfo = newValue as Record<string, string>;

      for (const [infoKey, infoValue] of Object.entries(updatedCustomerInfo)) {
        if (
          infoValue !==
          currentCustomerInfo[infoKey as keyof typeof currentCustomerInfo]
        ) {
          changes.push({
            field: `customerInfo.${infoKey}`,
            oldValue:
              currentCustomerInfo[
                infoKey as keyof typeof currentCustomerInfo
              ] || null,
            newValue: infoValue,
          });
        }
      }
    } else if (key === 'saveOffer' && currentRequest.saveOffer !== null) {
      // Handle saveOffer separately
      const currentSaveOffer = currentRequest.saveOffer;
      const updatedSaveOffer = newValue as Partial<RequestSaveOffer>;
      const saveOfferFields: (keyof RequestSaveOffer)[] = [
        'id',
        'title',
        'dateOffered',
        'dateAccepted',
        'dateDeclined',
        'dateConfirmed',
      ];

      for (const field of saveOfferFields) {
        if (updatedSaveOffer[field] !== currentSaveOffer[field]) {
          changes.push({
            field: `saveOffer.${field}`,
            oldValue: currentSaveOffer[field] || null,
            newValue: updatedSaveOffer[field] || null,
          });
        }
      }
    } else if (newValue !== currentRequest[key as keyof Request]) {
      changes.push({
        field: key,
        oldValue: currentRequest[key as keyof Request] as
          | string
          | number
          | boolean
          | null,
        newValue: newValue as string | number | boolean | null,
      });
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
