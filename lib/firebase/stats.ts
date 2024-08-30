import {
  Request,
  RequestLog,
  RequestStatus,
  Tenant,
  TenantType,
} from '@/lib/db/schema';
import { Firestore } from 'firebase-admin/firestore';

const ALL_STATUSES: RequestStatus[] = [
  'Pending',
  'Canceled',
  'Declined',
  'Save Offered',
  'Save Declined',
  'Save Accepted',
  'Save Confirmed',
];

export async function calculateStats(
  db: Firestore,
  tenantType: TenantType,
  tenantId: string,
) {
  const requestsRef = db.collection('requests');
  const logsRef = db.collection('requestsLog');
  const tenantsRef = db.collection('tenants');

  const query =
    tenantType === 'proxy'
      ? requestsRef.where('proxyTenantId', '==', tenantId)
      : requestsRef.where('providerTenantId', '==', tenantId);

  const [requestsSnapshot, logsSnapshot, tenantsSnapshot] = await Promise.all([
    query.get(),
    logsRef.get(),
    tenantsRef.get(),
  ]);

  const requests = requestsSnapshot.docs.map(doc => doc.data() as Request);
  const logs = logsSnapshot.docs.map(doc => doc.data() as RequestLog);
  const tenants = tenantsSnapshot.docs.map(doc => doc.data() as Tenant);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let totalResponseTimeDays = 0;
  let respondedRequestsCount = 0;
  const statusCounts: Record<RequestStatus, number> = ALL_STATUSES.reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {} as Record<RequestStatus, number>,
  );
  const dailyVolume: Record<string, number> = {};
  const sourceDistribution: Record<string, number> = {};
  const saveOfferCounts = { offered: 0, accepted: 0, declined: 0 };

  const logMap = new Map(logs.map(log => [log.requestId, log]));

  for (const request of requests) {
    // Status counts
    statusCounts[request.status]++;

    // Daily volume
    const submitDate = new Date(request.dateSubmitted);
    if (submitDate >= thirtyDaysAgo) {
      const dateKey = submitDate.toISOString().split('T')[0];
      dailyVolume[dateKey] = (dailyVolume[dateKey] || 0) + 1;
    }

    // Average response time
    if (request.dateResponded) {
      const responseTimeMs =
        new Date(request.dateResponded).getTime() -
        new Date(request.dateSubmitted).getTime();
      totalResponseTimeDays += responseTimeMs / (1000 * 60 * 60 * 24); // Convert to days
      respondedRequestsCount++;
    }

    // Source distribution
    sourceDistribution[request.proxyTenantId] =
      (sourceDistribution[request.proxyTenantId] || 0) + 1;

    // Save offer counts
    const log = logMap.get(request.id);
    if (log) {
      for (const change of log.changes) {
        if (change.field === 'status') {
          if (change.newValue === 'Save Offered') saveOfferCounts.offered++;
          if (change.newValue === 'Save Accepted') saveOfferCounts.accepted++;
          if (change.newValue === 'Save Declined') saveOfferCounts.declined++;
        }
      }
    }
  }

  const averageResponseTime =
    respondedRequestsCount > 0
      ? totalResponseTimeDays / respondedRequestsCount
      : 0;

  return {
    requests: {
      totalCount: requests.length,
      statusCounts,
      averageResponseTime: Math.round(averageResponseTime * 10) / 10, // Round to 0.1
      dailyVolume,
      sourceDistribution,
      saveOfferCounts,
    },
    tenants: tenants.map(tenant => ({ id: tenant.id, name: tenant.name })),
  };
}
