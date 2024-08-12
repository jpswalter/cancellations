import React from 'react';
import { Metadata } from 'next';
import Overview from '@/components/Overview/Overview';
import { ErrorBoundary } from 'react-error-boundary';

export const metadata: Metadata = {
  title: 'ProxyLink: Overview',
};

const Page: React.FC = () => {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Overview />
    </ErrorBoundary>
  );
};

export default Page;
