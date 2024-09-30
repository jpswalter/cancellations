import { getFirestore } from 'firebase-admin/firestore';
import {
  Request,
  RequestLog,
  RequestChange,
  TenantType,
  RequestSaveOffer,
  RequestAvgResponseTime,
} from '@/lib/db/schema';
import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { AUTH_COOKIE_NAME } from '@/constants/app.contants';

/**
 * Creates a request log entry in Firestore.
 * @param request - The request object containing log details.
 */
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
        updatedAt: Date.now(),
      },
    ],
    avgResponseTime: {
      provider: {
        ms: 0,
        hours: 0,
      },
      proxy: {
        ms: 0,
        hours: 0,
      },
    },
  };

  await logRef.set(logEntry);
};

type ChangeWithoutAuthor = Omit<RequestChange, 'changedBy' | 'updatedAt'>;
/**
 * Detects changes between the current request and the updated request.
 * @param currentRequest - The current request object.
 * @param updatedRequest - The updated request object.
 * @returns An array of changes detected.
 */
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

/**
 * Updates the request log with new changes and user information.
 * @param logId - The ID of the log to update.
 * @param newChanges - An array of changes to apply.
 * @param req - The NextRequest object containing user session information.
 */
export const updateRequestLog = async (
  logId: string,
  newChanges: ChangeWithoutAuthor[],
  req: NextRequest,
): Promise<void> => {
  const db = getFirestore();
  const logRef = db.collection('requestsLog').doc(logId);

  // Get user info from session cookie
  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    throw new Error('Unauthorized: No session cookie found');
  }

  try {
    const decodedClaim = await getAuth().verifySessionCookie(sessionCookie);
    const { email, tenantType, tenantId } = decodedClaim;

    const updatedAt = Date.now();

    const fullNewChanges: RequestChange[] = newChanges.map(change => ({
      ...change,
      changedBy: {
        email: email as string,
        tenantType: tenantType as TenantType,
        tenantId,
      },
      updatedAt,
    }));

    const logDoc = await logRef.get();
    const currentLog = logDoc.data() as RequestLog;

    const allChanges = [...(currentLog.changes || []), ...fullNewChanges];

    await logRef.update({
      changes: allChanges,
      avgResponseTime: calculateAverageResponseTime(allChanges),
    });
  } catch (error) {
    console.error('Error updating request log:', error);
    throw error;
  }
};

/**
 * Calculates the average response time for provider and proxy based on status changes.
 * @param changes - An array of RequestChange objects representing the changes.
 * @returns An object containing average response times for provider and proxy in both milliseconds and hours.
 */
export const calculateAverageResponseTime = (
  changes: RequestChange[],
): RequestAvgResponseTime => {
  const statusChanges = changes.filter(change => change.field === 'status');

  let totalProviderResponseTime = 0;
  let providerResponseCount = 0;
  let totalProxyResponseTime = 0;
  let proxyResponseCount = 0;

  for (let i = 1; i < statusChanges.length; i++) {
    const currentChange = statusChanges[i];
    const previousChange = statusChanges[i - 1];

    const timeDifference = currentChange.updatedAt - previousChange.updatedAt;

    if (currentChange.changedBy.tenantType === 'provider') {
      totalProviderResponseTime += timeDifference;
      providerResponseCount++;
    } else if (currentChange.changedBy.tenantType === 'proxy') {
      totalProxyResponseTime += timeDifference;
      proxyResponseCount++;
    }
  }

  const convertMsToHours = (ms: number): number =>
    parseFloat((ms / (1000 * 60 * 60)).toFixed(2));

  const avgProviderResponseTimeMs =
    providerResponseCount > 0
      ? totalProviderResponseTime / providerResponseCount
      : 0;
  const avgProxyResponseTimeMs =
    proxyResponseCount > 0 ? totalProxyResponseTime / proxyResponseCount : 0;

  const avgProviderResponseTimeHours = convertMsToHours(
    avgProviderResponseTimeMs,
  );
  const avgProxyResponseTimeHours = convertMsToHours(avgProxyResponseTimeMs);

  return {
    provider: {
      ms: avgProviderResponseTimeMs,
      hours: avgProviderResponseTimeHours,
    },
    proxy: {
      ms: avgProxyResponseTimeMs,
      hours: avgProxyResponseTimeHours,
    },
  };
};
