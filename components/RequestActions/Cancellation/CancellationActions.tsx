import { Button } from '@/components/ui/button';
import { FC, useMemo, useState } from 'react';
import ConfirmSaveOfferModal from './ConfirmSaveOfferModal';
import SaveOfferModal from './SaveOfferModal';
import ResolveCancellationModal from './ResolveCancellationModal';
import { InfoTooltip } from '../../ui/tooltip';
import { Request } from '@/lib/db/schema';
import { useTenant } from '@/hooks/useTenant';

const CancellationActions: FC<{ request: Request }> = ({ request }) => {
  const [saveOfferModal, setSaveOfferModal] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);
  const [confirmSaveOfferModal, setConfirmSaveOfferModal] = useState(false);

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

  const status = request.status;
  const requestAlreadyHadSaveOffer = request.saveOffer !== null;

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

  const { data: provider, isLoading } = useTenant(request.providerTenantId);

  const providerHasSaveOffersEnabled = useMemo(() => {
    return Number(provider?.saveOffers?.length) > 0;
  }, [provider]);

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
        {!providerHasSaveOffersEnabled && (
          <InfoTooltip text="Your organization has not created any save offers yet." />
        )}
        <Button
          onClick={openSaveOfferModal}
          color="blue"
          className="w-24"
          disabled={!providerHasSaveOffersEnabled}
          loading={isLoading}
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
        request={request}
      />
      <ResolveCancellationModal
        shown={resolveModal}
        request={request}
        closeModal={closeResolveModal}
        action={action}
      />
      <ConfirmSaveOfferModal
        isVisible={confirmSaveOfferModal}
        request={request}
        onClose={closeConfirmSaveOfferModal}
      />
    </div>
  );
};

export default CancellationActions;
