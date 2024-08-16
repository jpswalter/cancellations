import { RequestSaveOffer } from '@/lib/db/schema';
import { Button } from '@/components/ui';
import { FC, useState } from 'react';
import { CellProps } from './Cell';
import SaveOfferModal from './SaveOfferModal';
import { useAuth } from '@/hooks/useAuth';
import { Request } from '@/lib/db/schema';

const SaveOfferCell: FC<CellProps<Request, RequestSaveOffer>> = ({
  cell,
  row,
}) => {
  const [isVisibleModal, setIsModalVisible] = useState(false);
  const { userData } = useAuth();
  const isProviderUser = userData?.tenantType === 'provider';
  const offer = cell.row.original.saveOffer;
  const requestStatus = cell.row.original.status;
  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);
  const isFirstOffer =
    row?.original.saveOffer === undefined || row?.original.saveOffer === null;

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
            request={cell.row.original}
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
