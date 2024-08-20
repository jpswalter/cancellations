// file: components/RequestsList/RequestsList.tsx
'use client';
import { DateRangePicker } from '@tremor/react';
import { useQuery } from '@tanstack/react-query';
import { filterRequests, getRequests } from '@/lib/api/request';
import { useAuth } from '@/hooks/useAuth';
import { RequestStatus } from '@/lib/db/schema';
import CongratsEmpty from '@/components/RequestsTable/CongratsEmpty';
import ResolvedTable from './ResolvedTable';

const ActionsList: React.FC = () => {
  const { userData } = useAuth();
  const { tenantType, tenantId } = userData || {};

  const statusFilters = ['Save Confirmed', 'Canceled'] as RequestStatus[];

  const { data: requests } = useQuery({
    queryKey: ['requests', tenantType, tenantId],
    queryFn: () => getRequests(tenantType, tenantId),
    enabled: !!tenantType && !!tenantId,
    select: data => filterRequests(data, statusFilters),
  });

  if (!requests) return null;

  return (
    <div className="flex w-full">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="flex h-[72px] flex-none items-center justify-between gap-2 border-b bg-white px-[20px]">
          <h1 className="truncate">Resolved requests</h1>
          <div className="flex items-center gap-2">
            <DateRangePicker className="z-30 mx-auto max-w-sm" />
          </div>
        </div>
        <div className="p-4 flex flex-col space-y-4 h-full flex-1">
          <ResolvedTable
            requests={requests}
            EmptyComponent={CongratsEmpty}
            defaultSort={[{ id: 'dateResponded', desc: true }]}
          />
        </div>
      </div>
    </div>
  );
};

export default ActionsList;
