import { FC, useCallback, useState } from 'react';
import { Modal, Button } from '@/components/ui/';
import { Request, DeclineReason } from '@/lib/db/schema';
import CustomerInfoCard from '@/components/CustomerInfoCard/CustomerInfoCard';
import {
  IoMdCheckmarkCircleOutline,
  IoMdCloseCircleOutline,
} from 'react-icons/io';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRequest } from '@/lib/api/request';
import { useAuth } from '@/hooks/useAuth';
import DeclineReasonComponent from './DiscountDeclineReason';
import { useTableRowAnimation } from '@/components/ui/table/animation-context';

interface Props {
  shown: boolean;
  request: Request;
  closeModal: () => void;
  action: 'apply' | 'decline' | null;
}

const ResolveDiscountModal: FC<Props> = ({
  shown,
  request,
  closeModal,
  action,
}) => {
  const [declineReasons, setDeclineReasons] = useState<DeclineReason[]>([]);

  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const { closeRow } = useTableRowAnimation();
  const isConfirmDisabled =
    action === 'decline' && (!declineReasons || declineReasons.length === 0);

  const getRequestStatus = useCallback(() => {
    if (action === 'decline') {
      if (declineReasons.some(reason => reason.field === 'notQualified')) {
        return 'Not Qualified';
      }
      return 'Declined';
    }
    return 'Applied';
  }, [action, declineReasons]);

  const getDeclineReasons = useCallback(() => {
    const hasQualifiedReason = declineReasons.some(
      reason => reason.field === 'notQualified',
    );
    if (action === 'decline' && !hasQualifiedReason) {
      return declineReasons;
    }
    return null;
  }, [action, declineReasons]);

  const mutation = useMutation({
    mutationFn: updateRequest,
    onSuccess: () => {
      closeRow(request.id);
      closeModal();
      setTimeout(() => {
        if (userData?.tenantType && userData?.tenantId) {
          queryClient.invalidateQueries({
            queryKey: ['requests', userData.tenantType, userData.tenantId],
          });
        }
      }, 300);
    },
    onError: error => {
      console.error('Error updating request:', error);
    },
  });

  if (!shown) return null;

  const getResolveStatus = () => {
    if (action === 'apply') {
      return {
        icon: (
          <IoMdCheckmarkCircleOutline className="text-green-500 text-4xl" />
        ),
        message: "You're about to mark this Discount request as Applied",
        description:
          'Click "Confirm" if the discount has been successfully applied.',
        color: 'bg-green-100 border-green-500 text-green-700',
      };
    }
    if (action === 'decline') {
      return {
        icon: <IoMdCloseCircleOutline className="text-red-500 text-4xl" />,
        message: "You're about to mark this request as Declined",
        description:
          "This indicates that the customer's issue could not be resolved to their satisfaction.",
        color: 'bg-red-100 border-red-500 text-red-700',
      };
    }
  };

  const resolveStatus = getResolveStatus();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRequest: Request = {
      ...request,
      dateResponded: new Date().toISOString(),
      status: getRequestStatus(),
      declineReason: getDeclineReasons(),
    };
    mutation.mutate(updatedRequest);
  };

  return (
    <Modal
      shown={shown}
      onClose={closeModal}
      title={`Confirm Request ${action === 'apply' ? 'Apply' : 'Decline'}`}
      size="md"
      footer={
        <div className="flex justify-end space-x-4">
          <Button
            color="blue"
            onClick={onSubmit}
            loading={mutation.isPending}
            disabled={isConfirmDisabled}
          >
            Confirm
          </Button>
          <Button outline onClick={closeModal}>
            Cancel
          </Button>
        </div>
      }
    >
      <CustomerInfoCard customerInfo={request.customerInfo} />
      <div
        className={`mt-6 border-l-4 p-4 flex items-start space-x-4 ${resolveStatus?.color}`}
        role="alert"
      >
        {resolveStatus?.icon}
        <div>
          <p className="font-bold">{resolveStatus?.message}</p>
          <p className="mt-1">{resolveStatus?.description}</p>
          {action === 'decline' && (
            <>
              <p className="font-bold my-1">Please provide a reason</p>
              <DeclineReasonComponent
                request={request}
                setDeclineReasons={setDeclineReasons}
                selectedDeclineReasons={declineReasons}
              />
            </>
          )}
        </div>
      </div>

      <div
        className="mt-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4"
        role="alert"
      >
        <p className="font-bold">Important</p>
        <p>
          Please review the resolution status carefully. Once submitted, this
          report cannot be modified.
        </p>
      </div>

      {mutation.isError && (
        <p className="text-red-500 text-sm mt-2">
          Error updating request. Please try again.
        </p>
      )}
    </Modal>
  );
};

export default ResolveDiscountModal;
