import React from 'react';
import { Button, Modal } from '@/components/ui/';
import { SaveOffer } from '@/lib/db/schema';
import { IoMdCloseCircleOutline } from 'react-icons/io';

interface DeleteModalProps {
  isVisible: boolean;
  offer: SaveOffer | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isVisible,
  offer,
  onClose,
  onDelete,
}) => {
  if (!offer) return null;

  const handleDelete = () => {
    onDelete(offer.id);
    onClose();
  };

  return (
    <Modal
      shown={isVisible}
      onClose={onClose}
      title="Delete Save Offer"
      size="sm"
      footer={
        <div className="flex justify-end space-x-2">
          <Button color="zinc" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        <IoMdCloseCircleOutline className="text-red-500 text-6xl" />
        <p className="font-semibold my-2">{offer.title}</p>
        <div className="p-4 flex items-start text-gray-600" role="alert">
          <p className="font-bold">
            Are you sure you want to delete this save offer?
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;
