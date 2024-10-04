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
    <div className="flex w-full bg-gray-50">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-semibold text-gray-900">
              All requests
            </h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Filters</h2>
            <Filters {...filters} showSearchId={true} />
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <RequestsTable
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

export default RequestsList;
