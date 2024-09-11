import { TenantType } from '@/lib/db/schema';

export const getUrlForSuccessfullLogin = (tenantType: TenantType): string => {
  if (tenantType === 'provider') {
    return '/overview';
  } else if (tenantType === 'proxy') {
    return '/actions';
  }
  return '/settings';
};
