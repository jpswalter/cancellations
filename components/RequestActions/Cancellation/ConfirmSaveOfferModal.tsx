import React, { useState } from 'react';
import { Button, Modal } from '@/components/ui/';
import { Request, RequestStatus } from '@/lib/db/schema';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRequest } from '@/lib/api/request';
import { parseErrorMessage } from '@/utils/general';
import Spinner from '@/components/ui/spinner';
import { useTableRowAnimation } from '@/components/ui/table/animation-context';

interface ConfirmSaveOfferModalProps {
  isVisible: boolean;
  request: Request;
  onClose: () => void;
}

const ConfirmSaveOfferModal: React.FC<ConfirmSaveOfferModalProps> = ({
  isVisible,
  request,
  onClose,
}) => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { closeRow } = useTableRowAnimation();

  const mutation = useMutation({
    mutationFn: (updatedRequest: Request) => updateRequest(updatedRequest),
    onMutate: async updatedRequest => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['requests'] });
      closeRow(request.id);
      // Snapshot the previous value
      const previousRequests = queryClient.getQueryData<Request[]>([
        'requests',
      ]);
      setTimeout(() => {
        // Optimistically update to the new value
        queryClient.setQueryData<Request[]>(['requests'], old => {
          return old
            ? old.map(req =>
                req.id === updatedRequest.id ? updatedRequest : req,
              )
            : [];
        });
      }, 300);
      return { previousRequests };
    },
    onError: (err, _, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['requests'], context?.previousRequests);
      setError(parseErrorMessage(err));
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  if (!request) return null;

  const handleConfirm = () => {
    if (!request.saveOffer) {
      setError('Save offer data is missing.');
      return;
    }

    const updatedSaveOffer = {
      ...request.saveOffer,
      dateConfirmed: new Date().toISOString(),
    };

    const updatedRequest = {
      ...request,
      status: 'Save Confirmed' as RequestStatus,
      saveOffer: updatedSaveOffer,
    };

    mutation.mutate(updatedRequest);
  };

  return (
    <Modal
      shown={isVisible}
      onClose={onClose}
      title=""
      size="sm"
      footer={
        <div className="flex justify-end space-x-2">
          <Button color="zinc" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Spinner color="white" /> : 'Confirm'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        <IoMdCheckmarkCircleOutline className="text-green-500 text-6xl" />
        <p className="font-bold my-2">Confirm Save Offer Applied</p>
        <div className="p-2 flex items-start text-gray-600" role="alert">
          <p>
            Press confirm after you have applied the discount to the customer’s
            account.
          </p>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </Modal>
  );
};

export default ConfirmSaveOfferModal;
