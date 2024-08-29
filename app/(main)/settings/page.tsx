import { Metadata } from 'next';
import Settings from '@/components/Settings/Settings';
import { getTenant } from '@/lib/api/tenant';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'ProxyLink | Settings',
};

export default async function SettingsPage() {
  await initializeFirebaseAdmin();

  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return <div>Please log in to view this page.</div>;
  }

  try {
    const decodedClaim = await getAuth().verifySessionCookie(sessionCookie);

    // Extract tenantType and tenantId from the decoded token
    const { tenantType, tenantId } = decodedClaim;

    if (!tenantType || !tenantId) {
      throw new Error('Tenant information missing from token');
    }
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
      queryKey: ['tenant', tenantId],
      queryFn: () => getTenant(tenantId),
      staleTime: 0,
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Settings tenantId={tenantId} />
      </HydrationBoundary>
    );
  } catch (error) {
    console.error('Error verifying session or fetching data:', error);
    return <div>An error occurred. Please try logging in again.</div>;
  }
}
