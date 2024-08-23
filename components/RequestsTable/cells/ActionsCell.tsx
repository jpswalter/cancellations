import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Request } from '@/lib/db/schema';
import SaveOfferModal from './SaveOfferModal';
import ResolveModal from '../ResolveModal';
import { Row } from '@tanstack/react-table';

interface ActionsCellProps {
  row: Row<Request>;
}

const ActionsCell: React.FC<ActionsCellProps> = ({ row }) => {
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

  const renderButtons = () => {
    switch (row.original.status) {
      case 'Pending':
      case 'Declined':
        return (
          <>
            <Button onClick={openSaveOfferModal} color="blue">
              Save Offer
            </Button>
            <Button onClick={() => openResolveModal('cancel')} color="teal">
              Cancel
            </Button>
            <Button onClick={() => openResolveModal('decline')} color="red">
              Decline
            </Button>
          </>
        );
      case 'Save Declined':
        return (
          <>
            <Button onClick={() => openResolveModal('cancel')} color="teal">
              Cancel
            </Button>
            <Button onClick={() => openResolveModal('decline')} color="red">
              Decline
            </Button>
          </>
        );
      case 'Save Accepted':
        return (
          <Button onClick={() => openResolveModal('cancel')} color="blue">
            Confirm
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      <div className="flex space-x-2 justify-end">{renderButtons()}</div>

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
