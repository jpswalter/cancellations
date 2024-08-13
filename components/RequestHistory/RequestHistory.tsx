// components/RequestHistory/RequestHistory.tsx
import React from 'react';
import { Timeline } from '@/components/ui/timeline';
import { RequestWithLog } from '@/lib/db/schema';
import Spinner from '../ui/spinner';
import { useTimelineItems } from './useTimelineItems';

interface RequestHistoryProps {
  request: RequestWithLog | undefined;
  isLoading?: boolean;
}

const RequestHistory: React.FC<RequestHistoryProps> = ({
  request,
  isLoading,
}) => {
  const { items, titles } = useTimelineItems(request);

  return (
    <div className="p-4 rounded-lg">
      <h2 className="text-xl font-semibold flex items-center justify-center gap-2 mb-8">
        {isLoading ? 'Request History is loading...' : 'Request History'}
      </h2>
      {isLoading ? (
        <div className="w-full flex-1">
          <Spinner className="w-20 h-20 text-gray-500" color="gray" />
        </div>
      ) : (
        <Timeline items={items} dotAlignment="top" titles={titles} />
      )}
    </div>
  );
};

export default RequestHistory;
