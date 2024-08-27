// file: components/RequestsList/RequestsList.tsx
'use client';
import RequestsTable from '@/components/RequestsTable/RequestsTable';
import { useAuth } from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import Filters from '../Filters/Filters';

const RequestsList: React.FC = () => {
  const { userData } = useAuth();
  const { tenantType, tenantId } = userData || {};

  const { requests, isLoading, filters } = useRequests({
    tenantType,
    tenantId,
  });

  if (!requests) return null;

  return (
    <div className="flex w-full">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="flex h-[72px] flex-none items-center justify-between gap-2 border-b bg-white px-[20px]">
          <h1 className="truncate">All Requests</h1>
          <div className="flex items-center gap-2">
            <Filters {...filters} />
          </div>
        </div>
        <div className="p-4 flex flex-col space-y-4 h-full flex-1">
          <RequestsTable
            requests={requests}
            defaultSort={[{ id: 'dateResponded', desc: true }]}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default RequestsList;
