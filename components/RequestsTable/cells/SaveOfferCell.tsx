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

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);
  const isFirstOffer = row?.original.saveOffer === undefined;

  if (isProviderUser && isFirstOffer) {
    return (
      <div onClick={e => e.stopPropagation()}>
        <Button color="blue" onClick={openModal}>
          Save Offer
        </Button>
        <SaveOfferModal
          isVisible={isVisibleModal}
          closeModal={closeModal}
          request={cell.row.original}
        />
      </div>
    );
  }

  return offer?.title;
};

export default SaveOfferCell;
