// file: components/RequestDrawer/RequestDrawer.tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import { Request, RequestWithLog } from '@/lib/db/schema';
import RequestActions from '../RequestDetails/RequestActions';
import RequestCard from '../RequestDetails/RequestCard';
import { Drawer } from '../ui/drawer';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import RequestHistory from '../RequestHistory/RequestHistory';
import { getRequest } from '@/lib/api/request';

interface RequestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
}

const RequestDrawer: React.FC<RequestDrawerProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const { userData } = useAuth();
  const { tenantType, tenantId } = userData || {};

  const { data: requestWithLog, isLoading: isLogLoading } =
    useQuery<RequestWithLog>({
      queryKey: ['request', request?.id, tenantType, tenantId],
      queryFn: () => getRequest({ id: request?.id, tenantType, tenantId }),
      enabled: isOpen && !!request?.id && !!tenantType && !!tenantId,
    });

  console.log('requestWithLog isLogLoading', isLogLoading);

  const [isWidgetVisible, setIsWidgetVisible] = useState(false);
  const isActionNeeded: boolean = useMemo(() => {
    return (
      (tenantType === 'proxy' &&
        (request?.declineReason !== null ||
          request?.status === 'Save Offered')) ||
      (tenantType === 'provider' &&
        (request?.status === 'Save Accepted' ||
          request?.status === 'Save Declined'))
    );
  }, [tenantType, request]);

  useEffect(() => {
    if (isActionNeeded) {
      setIsWidgetVisible(isActionNeeded);
    }
  }, [isActionNeeded, request]);

  const queryClient = useQueryClient();

  const onFix = () => {
    setIsWidgetVisible(false);
    onClose();
    queryClient.invalidateQueries({
      queryKey: ['requests', tenantType, tenantId],
    });
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Request Details">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {isWidgetVisible && request && (
              <RequestActions
                action="fixDeclineReason"
                request={request}
                onFix={onFix}
              />
            )}
            <RequestCard request={request} />
            <RequestHistory request={requestWithLog} isLoading={isLogLoading} />
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default RequestDrawer;
