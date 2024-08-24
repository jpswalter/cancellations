import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Request } from '@/lib/db/schema';
import SaveOfferModal from './SaveOfferModal';
import ResolveModal from '../ResolveModal';
import { Row } from '@tanstack/react-table';

interface ActionsCellProps {
  row: Row<Request>;
  toggleDrawer: (request: Request, position?: 'left' | 'right') => void;
}

const ActionsCell: React.FC<ActionsCellProps> = ({ row, toggleDrawer }) => {
  const [saveOfferModal, setSaveOfferModal] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);
  const [action, setAction] = useState<'cancel' | 'decline' | null>(null);

  const openSaveOfferModal = () => setSaveOfferModal(true);
  const closeSaveOfferModal = () => setSaveOfferModal(false);
  const openResolveModal = (actionType: 'cancel' | 'decline') => {
    setAction(actionType);
    setResolveModal(true);
  };
  const closeResolveModal = () => {
    setResolveModal(false);
    setAction(null);
  };

  const status = row.original.status;

  const renderSaveOfferButton = () => {
    if (
      status === 'Save Declined' ||
      status === 'Canceled' ||
      status === 'Save Offered' ||
      status === 'Save Confirmed'
    )
      return null;
    return (
      <Button onClick={handleSaveOfferClick} color="blue" className="w-24">
        {status === 'Save Accepted' ? 'Confirm' : 'Save Offer'}
      </Button>
    );
  };

  const renderCancelButton = () => {
    if (
      status === 'Declined' ||
      status === 'Save Accepted' ||
      status === 'Canceled' ||
      status === 'Save Confirmed'
    )
      return null;
    return (
      <Button onClick={() => openResolveModal('cancel')} color="teal">
        Cancel
      </Button>
    );
  };

  const renderDeclineButton = () => {
    if (
      status === 'Declined' ||
      status === 'Save Accepted' ||
      status === 'Canceled' ||
      status === 'Save Confirmed'
    )
      return null;
    return (
      <Button onClick={() => openResolveModal('decline')} color="red">
        Decline
      </Button>
    );
  };

  const handleSaveOfferClick = () => {
    if (status === 'Save Accepted') {
      toggleDrawer(row.original, 'left');
    } else {
      openSaveOfferModal();
    }
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      <div className="flex space-x-2 justify-end">
        {renderSaveOfferButton()}
        {renderCancelButton()}
        {renderDeclineButton()}
      </div>

      <SaveOfferModal
        isVisible={saveOfferModal}
        closeModal={closeSaveOfferModal}
        request={row.original}
      />
      <ResolveModal
        shown={resolveModal}
        request={row.original}
        closeModal={closeResolveModal}
        action={action}
      />
    </div>
  );
};

export default ActionsCell;
