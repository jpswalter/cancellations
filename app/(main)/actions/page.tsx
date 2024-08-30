// file: app/(main)/actions/page.tsx
import { Metadata } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getRequests } from '@/lib/api/request';
import ActionsList from '@/components/ActionsList/ActionsList';

export const metadata: Metadata = {
  title: 'ProxyLink | Actions',
};

export default async function ActionsPage() {
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
      queryKey: ['requests', tenantType, tenantId],
      queryFn: () => getRequests(tenantType, tenantId),
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ActionsList tenantType={tenantType} tenantId={tenantId} />
      </HydrationBoundary>
    );
  } catch (error) {
    console.error('Error verifying session or fetching data:', error);
    return <div>An error occurred. Please try logging in again.</div>;
  }
}
