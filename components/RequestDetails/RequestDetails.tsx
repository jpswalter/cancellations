// file: components/RequestDetails/RequestDetails.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { getRequest } from '@/lib/api/request';
import { useAuth } from '@/hooks/useAuth';
import RequestActions from './RequestActions';
import RequestCard from './RequestCard';
import RequestHistory from '../RequestHistory/RequestHistory';

interface RequestDetailsProps {
  requestId: string;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ requestId }) => {
  const { userData } = useAuth();
  const { tenantType, tenantId } = userData || {};

  const {
    data: request,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['request', requestId, tenantType, tenantId],
    queryFn: () =>
      getRequest({
        id: requestId,
        tenantType,
        tenantId,
      }),
    enabled: !!requestId && !!tenantType && !!tenantId,
  });

  if (!request) return null;

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-red-600">
          Error fetching request
        </h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="flex h-[72px] flex-none items-center justify-between gap-2 border-b bg-white px-[20px]">
          <h1 className="truncate">Request Details</h1>
        </div>
        <div className="h-full flex-1 bg-gray-50">
          <div className="max-w-4xl p-4 flex flex-col space-y-4">
            <RequestActions request={request} />
            <RequestCard request={request} />
            <RequestHistory request={request} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
