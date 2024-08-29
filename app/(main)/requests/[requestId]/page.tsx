import { Metadata } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getRequest } from '@/lib/api/request';
import RequestDetails from '@/components/RequestDetails/RequestDetails';

export const metadata: Metadata = {
  title: 'ProxyLink | Request Details',
};

export default async function RequestPage({
  params,
}: {
  params: { requestId: string };
}) {
  await initializeFirebaseAdmin();

  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return <div>Please log in to view this page.</div>;
  }

  try {
    const decodedClaim = await getAuth().verifySessionCookie(sessionCookie);
    const { tenantType, tenantId } = decodedClaim;

    if (!tenantType || !tenantId) {
      throw new Error('Tenant information missing from token');
    }

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
      queryKey: ['request', params.requestId],
      queryFn: () => getRequest({ id: params.requestId, tenantType, tenantId }),
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RequestDetails requestId={params.requestId} />
      </HydrationBoundary>
    );
  } catch (error) {
    console.error('Error verifying session or fetching data:', error);
    return <div>An error occurred. Please try logging in again.</div>;
  }
}
