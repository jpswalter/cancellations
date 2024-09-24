import { TenantType, RequestStatus } from '@/lib/db/schema';
import { Firestore } from 'firebase-admin/firestore';

export interface CalculateStatsArgs {
  db: Firestore;
  tenantType: TenantType;
  tenantId: string;
  fromDate?: string;
  toDate?: string;
  sourceId?: string;
}

export interface CalculateStatsArgsResponse {
  requests: {
    totalCount: number;
    statusCounts: Record<RequestStatus, number>;
    averageResponseTime: number;
    dailyVolume: Record<string, number>;
    sourceDistribution: Record<string, number>;
    saveOfferCounts: {
      offered: number;
      accepted: number;
      declined: number;
    };
  };
  tenants: { id: string; name: string }[];
}
