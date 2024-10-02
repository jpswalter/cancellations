import { Button } from '@/components/ui/button';
import { FC, useState } from 'react';
import { Request } from '@/lib/db/schema';
import ResolveDiscountModal from './ResolveDiscountModal';

const DiscountActions: FC<{ request: Request }> = ({ request }) => {
  const [resolveModal, setResolveModal] = useState(false);

  const [action, setAction] = useState<'apply' | 'decline' | null>(null);

  const openResolveModal = (actionType: 'apply' | 'decline') => {
    setAction(actionType);
    setResolveModal(true);
  };
  const closeResolveModal = () => {
    setResolveModal(false);
    setAction(null);
  };

  const status = request.status;

  const renderApplyButton = () => {
    if (status === 'Declined' || status === 'Applied') return null;
    return (
      <Button onClick={() => openResolveModal('apply')} color="teal">
        Apply
      </Button>
    );
  };

  const renderDeclineButton = () => {
    if (status === 'Declined' || status === 'Applied') return null;
    return (
      <Button onClick={() => openResolveModal('decline')} color="red">
        Decline
      </Button>
    );
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      <div className="flex space-x-2 justify-end">
        {renderApplyButton()}
        {renderDeclineButton()}
      </div>
      <ResolveDiscountModal
        shown={resolveModal}
        request={request}
        closeModal={closeResolveModal}
        action={action}
      />
    </div>
  );
};

export default DiscountActions;
