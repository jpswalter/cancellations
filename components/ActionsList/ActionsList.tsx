// file: components/RequestsList/RequestsList.tsx
'use client';
import RequestsTable from '@/components/RequestsTable/RequestsTable';
import { useAuth } from '@/hooks/useAuth';
import { RequestStatus } from '@/lib/db/schema';
import CongratsEmpty from '@/components/RequestsTable/CongratsEmpty';
import { useRequests } from '@/hooks/useRequests';
import Filters from '../Filters/Filters';

const ActionsList: React.FC = () => {
  const { userData } = useAuth();
  const { tenantType, tenantId } = userData || {};

  const initialStatusFilters =
    tenantType === 'provider'
      ? (['Pending', 'Save Declined', 'Save Accepted'] as RequestStatus[])
      : (['Declined', 'Save Offered'] as RequestStatus[]);

  const { requests, isLoading, filters } = useRequests({
    tenantType,
    tenantId,
    initialStatusFilters,
  });

  if (!requests) return null;

  return (
    <div className="flex w-full h-full">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="flex h-[72px] flex-none items-center justify-between gap-2 border-b bg-white px-[20px]">
          <h1 className="truncate">Actions needed</h1>
          <div className="flex items-center gap-2">
            <Filters {...filters} showRequestTypeFilter={false} />
          </div>
        </div>
        <RequestsTable
          requests={requests}
          EmptyComponent={CongratsEmpty}
          defaultSort={[{ id: 'dateResponded', desc: true }]}
          isActionsTable={true}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ActionsList;
