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

export async function fetchStats(
  tenantType: string,
  tenantId: string,
): Promise<StatsResponse> {
  const response = await fetch(
    `/api/stats?tenantType=${tenantType}&tenantId=${tenantId}`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  return response.json();
}
