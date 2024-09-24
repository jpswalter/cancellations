import { StatsResponse } from '@/functions/src/calculateTenantStats';

interface FetchStatsParams {
  tenantType?: string;
  tenantId?: string;
  dateRange?: { from?: Date; to?: Date };
  selectedSource?: string;
}

export async function fetchStats({
  tenantType,
  tenantId,
  dateRange,
  selectedSource,
}: FetchStatsParams): Promise<StatsResponse | null> {
  console.log('fetchStats initial call with', {
    tenantType,
    tenantId,
    dateRange,
    selectedSource,
  });

  if (!tenantType || !tenantId) {
    return null;
  }

  const params = new URLSearchParams();
  params.append('tenantType', tenantType);
  params.append('tenantId', tenantId);

  if (dateRange?.from) {
    params.append('fromDate', dateRange.from.toISOString());
  }
  if (dateRange?.to) {
    params.append('toDate', dateRange.to.toISOString());
  }
  if (selectedSource) {
    params.append('sourceId', selectedSource);
  }

  console.log('fetchStats params', params.toString());
  const response = await fetch(`/api/stats?${params.toString()}`);
  console.log('fetchStats response', response);

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  return response.json();
}
