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

  const isButtonDisabled = (
    buttonType: 'saveOffer' | 'cancel' | 'decline' | 'confirm',
  ) => {
    switch (status) {
      case 'Pending':
        return false;
      case 'Declined':
        return (
          buttonType === 'cancel' ||
          buttonType === 'decline' ||
          buttonType === 'confirm'
        );
      case 'Save Declined':
        return buttonType === 'saveOffer';
      case 'Save Accepted':
        return buttonType !== 'confirm';
      default:
        return true;
    }
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
        <Button
          onClick={handleSaveOfferClick}
          disabled={isButtonDisabled(
            status === 'Save Accepted' ? 'confirm' : 'saveOffer',
          )}
          color="blue"
          className="w-24"
        >
          {status === 'Save Accepted' ? 'Confirm' : 'Save Offer'}
        </Button>
        <Button
          onClick={() => openResolveModal('cancel')}
          disabled={isButtonDisabled('cancel')}
          color="teal"
        >
          Cancel
        </Button>
        <Button
          onClick={() => openResolveModal('decline')}
          disabled={isButtonDisabled('decline')}
          color="red"
        >
          Decline
        </Button>
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
