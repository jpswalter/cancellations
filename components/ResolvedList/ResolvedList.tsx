'use client';
import { useAuth } from '@/hooks/useAuth';
import { RequestStatus } from '@/lib/db/schema';
import ResolvedTable from './ResolvedTable';
import Filters from '../Filters/Filters';
import { useRequests } from '@/hooks/useRequests';
import { useMemo } from 'react';

const ResolvedList: React.FC = () => {
  const { userData } = useAuth();
  const { tenantType, tenantId } = userData || {};

  const statusFilters = useMemo(
    () =>
      [
        'Save Confirmed',
        'Canceled',
        'Applied',
        'Not Qualified',
      ] as RequestStatus[],
    [],
  );

  const { requests, isLoading, filters } = useRequests({
    tenantType,
    tenantId,
    initialStatusFilters: statusFilters,
  });

  if (!requests) return null;

  return (
    <div className="flex w-full bg-gray-50">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-semibold text-gray-900">
              Resolved Requests
            </h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Filters</h2>
            <Filters {...filters} showStatusFilter={true} showSearchId={true} />
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <ResolvedTable
              requests={requests}
              defaultSort={[{ id: 'dateResponded', desc: true }]}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolvedList;
