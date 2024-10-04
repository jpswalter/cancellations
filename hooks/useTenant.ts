import { useQuery } from '@tanstack/react-query';
import { getTenant } from '@/lib/api/tenant';
import { Tenant } from '@/lib/db/schema';

export function useTenant(tenantId?: string) {
  return useQuery<Tenant, Error>({
    queryKey: ['tenant', tenantId],
    queryFn: () => getTenant(tenantId),
    enabled: !!tenantId,
  });
}
