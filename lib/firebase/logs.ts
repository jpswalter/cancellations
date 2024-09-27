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
        updatedAt: new Date().toISOString(),
      },
    ],
    avgResponseTime: {
      provider: 0,
      proxy: 0,
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
  const sessionCookie = req.cookies.get('session')?.value;
  if (!sessionCookie) {
    throw new Error('Unauthorized: No session cookie found');
  }

  try {
    const decodedClaim = await getAuth().verifySessionCookie(sessionCookie);
    const { email, tenantType, tenantId } = decodedClaim;

    const updatedAt = new Date().toISOString();

    const fullNewChanges: RequestChange[] = newChanges.map(change => ({
      ...change,
      changedBy: {
        email: email as string,
        tenantType: tenantType as TenantType,
        tenantId,
      },
      updatedAt,
    }));

    // Получаем текущий документ
    const logDoc = await logRef.get();
    const currentLog = logDoc.data() as RequestLog;

    // Объединяем существующие и новые изменения
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
 * @returns An object containing average response times for provider and proxy.
 */
const calculateAverageResponseTime = (
  changes: RequestChange[],
): RequestAvgResponseTime => {
  // Step 1: Filter only status changes
  const statusChanges = changes.filter(change => change.field === 'status');

  // Variables for calculating response time
  let totalProviderResponseTime = 0;
  let providerResponseCount = 0;

  let totalProxyResponseTime = 0;
  let proxyResponseCount = 0;

  // Step 2: Iterate through all status changes
  for (let i = 1; i < statusChanges.length; i++) {
    const currentChange = statusChanges[i];
    const previousChange = statusChanges[i - 1];

    // Calculate the time difference between the current and previous change
    const currentChangeTime = new Date(currentChange.updatedAt).getTime();
    const previousChangeTime = new Date(previousChange.updatedAt).getTime();
    const timeDifference = currentChangeTime - previousChangeTime;

    // Step 3: Determine who made the current change
    if (currentChange.changedBy.tenantType === 'provider') {
      // If the current change was made by the provider, this is their response time
      totalProviderResponseTime += timeDifference;
      providerResponseCount++;
    } else if (currentChange.changedBy.tenantType === 'proxy') {
      // If the current change was made by the proxy, this is their response time
      totalProxyResponseTime += timeDifference;
      proxyResponseCount++;
    }
  }

  // Calculate average response time for each side
  const avgProviderResponseTime =
    providerResponseCount > 0
      ? totalProviderResponseTime / providerResponseCount
      : 0;
  const avgProxyResponseTime =
    proxyResponseCount > 0 ? totalProxyResponseTime / proxyResponseCount : 0;

  return {
    provider: avgProviderResponseTime,
    proxy: avgProxyResponseTime,
  };
};
