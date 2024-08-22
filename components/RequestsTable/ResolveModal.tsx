import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { Modal, Button } from '@/components/ui/';
import { Request } from '@/lib/db/schema';
import UserInfoCard from './UserInfoCard';
import {
  IoMdCheckmarkCircleOutline,
  IoMdCloseCircleOutline,
} from 'react-icons/io';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRequest } from '@/lib/api/request';
import { useAuth } from '@/hooks/useAuth';
import DeclineReason from './DeclineReason';

interface Props {
  shown: boolean;
  request: Request;
  closeModal: () => void;
}

const ResolveModal: FC<Props> = ({ shown, request, closeModal }) => {
  const {
    watch,
    formState: { errors },
    reset,
  } = useFormContext();
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  const successfullyResolved = watch('successfullyResolved');
  const declineReason = watch('declineReason');

  const mutation = useMutation({
    mutationFn: updateRequest,
    onSuccess: () => {
      if (userData?.tenantType && userData?.tenantId) {
        queryClient.invalidateQueries({
          queryKey: ['requests', userData.tenantType, userData.tenantId],
        });
      }
      reset();
      closeModal();
    },
    onError: error => {
      console.error('Error updating request:', error);
    },
  });

  if (!shown) return null;

  const getResolveStatus = () => {
    if (successfullyResolved === true) {
      return {
        icon: (
          <IoMdCheckmarkCircleOutline className="text-green-500 text-4xl" />
        ),
        message: "You're about to mark this request as Successfully Resolved",
        description:
          "This indicates that the customer's issue has been addressed satisfactorily.",
        color: 'bg-green-100 border-green-500 text-green-700',
      };
    }
    if (successfullyResolved === false) {
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
      successfullyResolved,
      dateResponded: new Date().toISOString(),
      status: successfullyResolved ? 'Canceled' : 'Declined',
      declineReason: successfullyResolved ? null : declineReason,
    };
    mutation.mutate(updatedRequest);
  };

  return (
    <Modal
      shown={shown}
      onClose={closeModal}
      title="Confirm Request Resolution"
      size="md"
      footer={
        <div className="flex justify-end space-x-4">
          <Button color="blue" onClick={onSubmit} loading={mutation.isPending}>
            Confirm and Report
          </Button>
          <Button outline onClick={closeModal}>
            Cancel
          </Button>
        </div>
      }
    >
      <UserInfoCard request={request} />
      <div
        className={`mt-6 border-l-4 p-4 flex items-start space-x-4 ${resolveStatus?.color}`}
        role="alert"
      >
        {resolveStatus?.icon}
        <div>
          <p className="font-bold">{resolveStatus?.message}</p>
          <p className="mt-1">{resolveStatus?.description}</p>
          {successfullyResolved === false && (
            <>
              <p className="font-bold my-1">Please provide a reason</p>
              <DeclineReason request={request} />
            </>
          )}
        </div>
      </div>

      {errors.successfullyResolved && (
        <p className="text-red-500 text-sm mt-2">
          {errors.successfullyResolved?.message as string}
        </p>
      )}

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

export default ResolveModal;
