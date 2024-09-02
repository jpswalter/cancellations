import { RequestStatus as RequestStatusType } from '@/lib/db/schema';

const RequestStatus = ({ status }: { status: RequestStatusType }) => {
  const colorMap: Record<RequestStatusType, string> = {
    Pending: 'bg-sky-100 text-sky-800',
    Canceled: 'bg-green-100 text-green-800',
    Declined: 'bg-red-100 text-red-800',
    'Save Offered': 'bg-amber-100 text-amber-600',
    'Save Declined': 'bg-amber-100 text-red-600',
    'Save Accepted': 'bg-amber-100 text-green-800',
    'Save Confirmed': 'bg-amber-100 text-amber-800',
  };

  return (
    <div
      className={`w-fit text-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorMap[status] ?? ''}`}
    >
      {status}
    </div>
  );
};

export default RequestStatus;
