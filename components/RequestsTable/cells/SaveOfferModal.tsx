import React, { useState, useMemo } from 'react';
import { Modal, Button } from '@/components/ui/';
import { Select as SelectTremor, SelectItem } from '@tremor/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IoMdSave } from 'react-icons/io';
import { Request, RequestStatus, SaveOffer } from '@/lib/db/schema';
import { updateRequest } from '@/lib/api/request';
import { getTenants } from '@/lib/api/tenant';
import Spinner from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';

interface SaveOfferModalProps {
  isVisible: boolean;
  request: Request;
  closeModal: () => void;
}

const SaveOfferModal: React.FC<SaveOfferModalProps> = ({
  isVisible,
  request,
  closeModal,
}) => {
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
  });
  const offers = tenants?.find(
    t => t.id === request.providerTenantId,
  )?.saveOffers;

  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const mutation = useMutation({
    mutationFn: (offer: SaveOffer) => {
      const updatedRequest = {
        ...request,
        status: 'Save Offered' as RequestStatus,
        saveOffer: { ...offer, dateOffered: new Date().toISOString() },
      };
      return updateRequest(updatedRequest);
    },
    onSuccess: () => {
      if (userData?.tenantType && userData?.tenantId) {
        queryClient.invalidateQueries({
          queryKey: ['requests', userData.tenantType, userData.tenantId],
        });
      }
    },
    onSettled: () => {
      closeModal();
    },
  });

  const selectedOffer = useMemo(() => {
    return offers?.find(o => o.id === selectedOfferId) || null;
  }, [selectedOfferId, offers]);

  const handleSelectChange = (value: string) => {
    setSelectedOfferId(value);
  };

  const handleConfirm = () => {
    if (selectedOffer) {
      mutation.mutate(selectedOffer);
    }
  };

  const options = offers?.map(offer => ({
    value: offer.id,
    label: offer.title,
  }));

  return (
    <Modal shown={isVisible} onClose={closeModal} title="Save Offer">
      <div className="flex flex-col gap-4">
        <p className="text-gray-600">
          Choose a save offer to retain{' '}
          <span className="font-bold">
            {request.customerInfo.customerEmail}
          </span>
          . The selected offer will be applied to their account.
        </p>

        <SelectTremor
          enableClear={false}
          className="w-60"
          placeholder="Select an offer"
          value={selectedOfferId}
          onValueChange={handleSelectChange}
        >
          {options?.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectTremor>
        {selectedOffer && (
          <div>
            <h3 className="text-xl font-semibold mb-2">
              What Customer Will See
            </h3>
            <p className="break-words whitespace-pre-wrap">
              {selectedOffer.description}
            </p>
          </div>
        )}
        <div className="flex justify-end space-x-4 mt-4">
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleConfirm} color="blue">
            {mutation.isPending ? (
              <Spinner color="white" />
            ) : (
              <>
                <IoMdSave className="text-xl" /> Confirm Offer
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SaveOfferModal;
