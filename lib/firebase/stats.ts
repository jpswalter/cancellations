import {
  Request,
  RequestLog,
  RequestStatus,
  TenantType,
  Tenant,
} from '@/lib/db/schema';
import {
  Firestore,
  Query,
  CollectionReference,
} from 'firebase-admin/firestore';
import { addDays, format, subDays, startOfMonth, isBefore } from 'date-fns';
import { StatsResponse } from '@/functions/src/calculateTenantStats';

const ALL_STATUSES: RequestStatus[] = [
  'Pending',
  'Canceled',
  'Declined',
  'Save Offered',
  'Save Declined',
  'Save Accepted',
  'Save Confirmed',
];

export async function calculateStats({
  db,
  tenantType,
  tenantId,
  fromDate,
  toDate,
  sourceId,
}: {
  db: Firestore;
  tenantType: TenantType;
  tenantId: string;
  fromDate?: string;
  toDate?: string;
  sourceId?: string;
}): Promise<StatsResponse> {
  let query: Query<Request> | CollectionReference<Request> = db.collection(
    'requests',
  ) as CollectionReference<Request>;

  if (tenantType === 'proxy') {
    query = query.where('proxyTenantId', '==', tenantId);
  } else {
    query = query.where('providerTenantId', '==', tenantId);
  }

  if (fromDate) {
    query = query.where('dateSubmitted', '>=', fromDate);
  }
  if (toDate) {
    query = query.where('dateSubmitted', '<=', toDate);
  }
  if (sourceId && tenantType === 'provider') {
    query = query.where('proxyTenantId', '==', sourceId);
  }

  const [requestsSnapshot, logsSnapshot, tenantsSnapshot] = await Promise.all([
    query.get(),
    db.collection('requestsLog').get(),
    db.collection('tenants').get(),
  ]);

  const requests = requestsSnapshot.docs.map(doc => doc.data() as Request);
  const logs = logsSnapshot.docs.map(doc => doc.data() as RequestLog);
  const tenants = tenantsSnapshot.docs.map(doc => doc.data() as Tenant);

  const logMap = new Map(logs.map(log => [log.requestId, log]));

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

  const today = new Date();
  const isEarlyInMonth = today.getDate() <= 5;

  let startDate: Date;
  if (isEarlyInMonth) {
    startDate = subDays(startOfMonth(today), 5);
  } else {
    startDate = startOfMonth(today);
  }

  let currentDate = startDate;

  while (
    isBefore(currentDate, today) ||
    format(currentDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  ) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    dailyVolume[dateKey] = 0;
    currentDate = addDays(currentDate, 1);
  }

  for (const request of requests) {
    const submitDate = new Date(request.dateSubmitted);
    if (isBefore(submitDate, startDate)) continue;

    const dateKey = format(submitDate, 'yyyy-MM-dd');
    if (dateKey in dailyVolume) {
      dailyVolume[dateKey]++;
    }

    // Status counts
    statusCounts[request.status]++;

    // Daily volume
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

  const uniqueTenantIds = new Set(
    requests.map(request => request.proxyTenantId),
  );
  const relevantTenants = tenants.filter(tenant =>
    uniqueTenantIds.has(tenant.id),
  );

  return {
    requests: {
      totalCount: requests.length,
      statusCounts,
      averageResponseTime: Math.round(averageResponseTime * 10) / 10, // Round to 0.1
      dailyVolume,
      sourceDistribution,
      saveOfferCounts,
    },
    tenants: relevantTenants.map(({ id, name }) => ({ id, name })),
  };
}
