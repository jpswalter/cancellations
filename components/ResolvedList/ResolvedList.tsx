// file: components/RequestsList/RequestsList.tsx
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
    <div className="flex w-full">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="flex h-[72px] flex-none items-center justify-stretch gap-2 border-b bg-white px-[20px]">
          <Filters {...filters} showStatusFilter={true} showSearchId={true} />
        </div>
        <div className="p-4 flex flex-col space-y-4 h-full flex-1">
          <ResolvedTable
            requests={requests}
            defaultSort={[{ id: 'dateResponded', desc: true }]}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ResolvedList;
