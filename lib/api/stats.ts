export interface StatsResponse {
  requests: {
    totalCount: number;
    statusCounts: Record<string, number>;
    averageResponseTime: number;
    dailyVolume: Record<string, number>;
    sourceDistribution: Record<string, number>;
    saveOfferCounts: {
      offered: number;
      accepted: number;
      declined: number;
    };
  };
  tenants: Array<{ id: string; name: string }>;
}

interface FetchStatsParams {
  tenantType: string;
  tenantId: string;
  dateRange?: { from?: Date; to?: Date };
  selectedSource?: string;
}

export async function fetchStats({
  tenantType,
  tenantId,
  dateRange,
  selectedSource,
}: FetchStatsParams): Promise<StatsResponse> {
  const params = new URLSearchParams({
    tenantType,
    tenantId,
  });

  if (dateRange?.from) {
    params.append('fromDate', dateRange.from.toISOString());
  }
  if (dateRange?.to) {
    params.append('toDate', dateRange.to.toISOString());
  }
  if (selectedSource) {
    params.append('sourceId', selectedSource);
  }

  const response = await fetch(`/api/stats?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  return response.json();
}
