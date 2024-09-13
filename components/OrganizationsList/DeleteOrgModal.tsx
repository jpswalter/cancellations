import React from 'react';
import { Button, Modal } from '@/components/ui/';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { deleteOrganization } from '@/lib/api/organization';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface DeleteOrgModalProps {
  isVisible: boolean;
  orgId: string;
  orgName: string;
  onClose: () => void;
}

const DeleteOrgModal: React.FC<DeleteOrgModalProps> = ({
  isVisible,
  orgId,
  orgName,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteOrganization,
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success(message);
      onClose();
    },
    onError: ({ message }) => {
      toast.error(message);
    },
  });
  const handleDelete = () => {
    mutation.mutate(orgId);
  };

  return (
    <Modal
      shown={isVisible}
      onClose={onClose}
      title="Delete Organization"
      size="sm"
      footer={
        <div className="flex justify-end space-x-2">
          <Button color="zinc" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleDelete}
            loading={mutation.isPending}
          >
            Delete
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        <IoMdCloseCircleOutline className="text-red-500 text-6xl" />
        <p className="font-semibold my-2">{orgName}</p>
        <div className="p-4 flex items-start text-gray-600" role="alert">
          <p className="font-bold">
            Are you sure you want to delete this organization?
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteOrgModal;
