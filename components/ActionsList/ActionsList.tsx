// file: components/RequestsList/RequestsList.tsx
'use client';
import RequestsTable from '@/components/RequestsTable/RequestsTable';
import { RequestStatus, TenantType } from '@/lib/db/schema';
import CongratsEmpty from '@/components/RequestsTable/CongratsEmpty';
import { useRequests } from '@/hooks/useRequests';
import Filters from '../Filters/Filters';
import { useMemo } from 'react';

interface Props {
  tenantType: TenantType | undefined;
  tenantId: string | undefined;
}

const ActionsList: React.FC<Props> = ({ tenantType, tenantId }) => {
  const initialStatusFilters = useMemo(() => {
    return tenantType === 'provider'
      ? (['Pending', 'Save Declined', 'Save Accepted'] as RequestStatus[])
      : (['Declined', 'Save Offered'] as RequestStatus[]);
  }, [tenantType]);

  const { requests, isLoading, filters } = useRequests({
    tenantType,
    tenantId,
    initialStatusFilters,
  });

  if (!requests || !tenantType || !tenantId) return null;

  return (
    <div className="flex w-full bg-gray-50">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div>
          <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-0">
            <h1 className="text-3xl font-semibold text-gray-900">
              Actions needed
            </h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Filters</h2>
            <Filters {...filters} />
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <RequestsTable
              requests={requests}
              EmptyComponent={CongratsEmpty}
              defaultSort={[{ id: 'dateResponded', desc: true }]}
              isActionsTable={true}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionsList;
