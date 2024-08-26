// file: components/RequestsList/RequestsList.tsx
'use client';
import { useAuth } from '@/hooks/useAuth';
import { RequestStatus } from '@/lib/db/schema';
import CongratsEmpty from '@/components/RequestsTable/CongratsEmpty';
import ResolvedTable from './ResolvedTable';
import Filters from '../Filters/Filters';
import { useRequests } from '@/hooks/useRequests';

const ActionsList: React.FC = () => {
  const { userData } = useAuth();
  const { tenantType, tenantId } = userData || {};

  const statusFilters = ['Save Confirmed', 'Canceled'] as RequestStatus[];

  const { requests, isLoading, filters } = useRequests({
    tenantType,
    tenantId,
    initialStatusFilters: statusFilters,
  });

  if (!requests) return null;

  return (
    <div className="flex w-full">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="flex h-[72px] flex-none items-center justify-between gap-2 border-b bg-white px-[20px]">
          <h1 className="truncate">Resolved requests</h1>
          <Filters
            {...filters}
            showRequestTypeFilter={true}
            showSearchIdFilter={true}
          />
        </div>
        <div className="p-4 flex flex-col space-y-4 h-full flex-1">
          <ResolvedTable
            requests={requests}
            EmptyComponent={CongratsEmpty}
            defaultSort={[{ id: 'dateResponded', desc: true }]}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ActionsList;
