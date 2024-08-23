// file: components/RequestDrawer/RequestDrawer.tsx
'use client';
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
  drawerPosition: 'left' | 'right';
}

const RequestDrawer: React.FC<RequestDrawerProps> = ({
  isOpen,
  onClose,
  request,
  drawerPosition,
}) => {
  const { userData } = useAuth();
  const { tenantType, tenantId } = userData || {};

  const { data: requestWithLog, isLoading: isLogLoading } =
    useQuery<RequestWithLog>({
      queryKey: ['request', request?.id, tenantType, tenantId],
      queryFn: () => getRequest({ id: request?.id, tenantType, tenantId }),
      enabled: isOpen && !!request?.id && !!tenantType && !!tenantId,
    });

  const queryClient = useQueryClient();

  const onFix = () => {
    onClose();
    queryClient.invalidateQueries({
      queryKey: ['requests', tenantType, tenantId],
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Request Details"
      width="w-2/3"
      position={drawerPosition}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {request && <RequestActions request={request} onFix={onFix} />}
            <RequestCard request={request} />
            <RequestHistory request={requestWithLog} isLoading={isLogLoading} />
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default RequestDrawer;
