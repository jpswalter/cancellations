import { Metadata } from 'next';
import Settings from '@/components/Settings/Settings';
import { getTenants } from '@/lib/api/tenant';
import { QueryClient } from '@tanstack/react-query';

export const metadata: Metadata = {
  title: 'Settings',
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
  });

  return <Settings />;
}
