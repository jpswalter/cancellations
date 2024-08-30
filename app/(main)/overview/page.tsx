import React from 'react';
import { Metadata } from 'next';
import Overview from '@/components/Overview/Overview';
import { ErrorBoundary } from 'react-error-boundary';
import { fetchStats } from '@/lib/api/stats';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'ProxyLink | Overview',
};

const OverviewPage: React.FC = async () => {
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
      queryKey: ['stats', tenantType, tenantId],
      queryFn: () => fetchStats(tenantType, tenantId),
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Overview tenantType={tenantType} tenantId={tenantId} />
        </ErrorBoundary>
      </HydrationBoundary>
    );
  } catch (error) {
    console.error('Error verifying session or fetching data:', error);
    return <div>An error occurred. Please try logging in again.</div>;
  }
};

export default OverviewPage;
