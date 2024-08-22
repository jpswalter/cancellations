import { Button } from '@/components/ui';
import { FC, useState } from 'react';
import SaveOfferModal from './SaveOfferModal';
import { useAuth } from '@/hooks/useAuth';
import { Request } from '@/lib/db/schema';
import { Row } from '@tanstack/react-table';

type Props = {
  row: Row<Request>;
  toggleDrawer: (request: Request) => void;
};
const SaveOfferCell: FC<Props> = ({ row, toggleDrawer }) => {
  const [isVisibleModal, setIsModalVisible] = useState(false);
  const { userData } = useAuth();
  const isProviderUser = userData?.tenantType === 'provider';
  const offer = row.original.saveOffer;
  const requestStatus = row.original.status;
  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);
  const isFirstOffer =
    row?.original.saveOffer === undefined || row?.original.saveOffer === null;
  const handleClick = () => {
    toggleDrawer(row.original);
  };

  if (isProviderUser) {
    if (isFirstOffer && requestStatus !== 'Canceled') {
      return (
        <div onClick={e => e.stopPropagation()}>
          <Button color="blue" onClick={openModal}>
            Make Offer
          </Button>
          <SaveOfferModal
            isVisible={isVisibleModal}
            closeModal={closeModal}
            request={row.original}
          />
        </div>
      );
    }

    if (requestStatus === 'Save Declined') {
      return (
        <div>
          <p className="text-red-500">Save declined</p>
          <p>Proceed to cancel subscription</p>
        </div>
      );
    }

    if (requestStatus === 'Save Accepted') {
      return (
        <div>
          <p className="text-green-500">Save accepted</p>
          <p>Proceed to apply save offer</p>
          <div onClick={e => e.stopPropagation()} className="mt-2">
            <Button color="yellow" onClick={handleClick}>
              Confirm
            </Button>
          </div>
        </div>
      );
    }

    if (requestStatus === 'Save Offered') {
      return (
        <div>
          <p className="text-blue-500">Waiting decision</p>
        </div>
      );
    }

    if (requestStatus === 'Save Confirmed') {
      return (
        <div>
          <p className="text-green-500">Save applied</p>
        </div>
      );
    }

    if (requestStatus === 'Canceled' || requestStatus === 'Declined') {
      return '';
    }
  }

  return offer?.title;
};

export default SaveOfferCell;
