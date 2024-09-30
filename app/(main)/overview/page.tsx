import React from 'react';
import { Metadata } from 'next';
import Overview from '@/components/Overview/Overview';
import { ErrorBoundary } from 'react-error-boundary';
import { getRequests } from '@/lib/api/request';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/constants/app.contants';

export const metadata: Metadata = {
  title: 'ProxyLink | Overview',
};

const OverviewPage: React.FC = async () => {
  await initializeFirebaseAdmin();

  const sessionCookie = cookies().get(AUTH_COOKIE_NAME)?.value;
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
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Overview />
        </ErrorBoundary>
      </HydrationBoundary>
    );
  } catch (error) {
    console.error('Error verifying session or fetching data:', error);
    return <div>An error occurred. Please try logging in again.</div>;
  }
};

export default OverviewPage;
