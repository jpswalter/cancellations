import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Request } from '@/lib/db/schema';
import SaveOfferModal from './SaveOfferModal';
import ResolveModal from '../ResolveModal';
import { Row } from '@tanstack/react-table';
import ConfirmSaveOfferModal from './ConfirmSaveOfferModal';
import { useAuth } from '@/hooks/useAuth';
import { getTenants } from '@/lib/api/tenant';
import { useQuery } from '@tanstack/react-query';
import { InfoTooltip } from '@/components/ui/tooltip';

interface ActionsCellProps {
  row: Row<Request>;
}

const ActionsCell: React.FC<ActionsCellProps> = ({ row }) => {
  const [saveOfferModal, setSaveOfferModal] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);
  const [confirmSaveOfferModal, setConfirmSaveOfferModal] = useState(false);
  const { userData } = useAuth();
  const tenantId = userData?.tenantId;

  const { data: tenant } = useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
    select: tenants => tenants.find(tenant => tenant.id === tenantId),
  });

  const tenantHasSaveOffers = Number(tenant?.saveOffers?.length) > 0;

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

  const openConfirmSaveOfferModal = () => setConfirmSaveOfferModal(true);
  const closeConfirmSaveOfferModal = () => setConfirmSaveOfferModal(false);

  const status = row.original.status;
  const requestAlreadyHadSaveOffer = row.original.saveOffer !== null;

  const renderSaveOfferConfirmButton = () => {
    if (status === 'Save Accepted')
      return (
        <Button
          onClick={openConfirmSaveOfferModal}
          color="blue"
          className="w-24"
        >
          Confirm
        </Button>
      );
    return null;
  };

  const renderSaveOfferButton = () => {
    if (
      status === 'Save Declined' ||
      status === 'Canceled' ||
      status === 'Save Offered' ||
      status === 'Save Confirmed' ||
      requestAlreadyHadSaveOffer
    ) {
      return null;
    }
    return (
      <div className="flex items-center space-x-2">
        {!tenantHasSaveOffers && (
          <InfoTooltip text="Your organization has not created any save offers yet." />
        )}
        <Button
          onClick={openSaveOfferModal}
          color="blue"
          className="w-24"
          disabled={!tenantHasSaveOffers}
        >
          Save Offer
        </Button>
      </div>
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

  return (
    <div onClick={e => e.stopPropagation()}>
      <div className="flex space-x-2 justify-end">
        {renderSaveOfferConfirmButton()}
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
      <ConfirmSaveOfferModal
        isVisible={confirmSaveOfferModal}
        request={row.original}
        onClose={closeConfirmSaveOfferModal}
      />
    </div>
  );
};

export default ActionsCell;
