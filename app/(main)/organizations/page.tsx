import { Metadata } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getTenants } from '@/lib/api/tenant';
import OrganizationsList from '@/components/OrganizationsList/OrganizationsList';
import { AUTH_COOKIE_NAME } from '@/constants/app.contants';

export const metadata: Metadata = {
  title: 'ProxyLink | Organisations',
};

export default async function OrganisationsPage() {
  await initializeFirebaseAdmin();

  const sessionCookie = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return <div>Please log in to view this page.</div>;
  }

  try {
    const decodedClaim = await getAuth().verifySessionCookie(sessionCookie);

    // Extract tenantType from the decoded token
    const { tenantType } = decodedClaim;

    if (tenantType !== 'management') {
      throw new Error('Unauthorized access');
    }

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
      queryKey: ['tenants'],
      queryFn: getTenants,
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <OrganizationsList />
      </HydrationBoundary>
    );
  } catch (error) {
    console.error('Error verifying session or fetching data:', error);
    return <div>An error occurred. Please try logging in again.</div>;
  }
}
