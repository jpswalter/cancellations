import { Button } from '@/components/ui/button';
import { SaveOffer } from '@/lib/db/schema';
import { useState } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import DeleteModal from './DeleteModal';
import EditModal from './EditModal';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createSaveOffer,
  updateSaveOffer,
  deleteSaveOffer,
} from '@/lib/api/tenant';
import { Card } from '@tremor/react';

type SaveOffersTabProps = {
  isAdmin: boolean;
  offers?: SaveOffer[];
  tenantId: string;
  refetch: () => void;
};

const SaveOffersTab: React.FC<SaveOffersTabProps> = ({
  isAdmin,
  offers = [],
  tenantId,
}) => {
  const [selectedOffer, setSelectedOffer] = useState<SaveOffer | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (newOffer: Partial<SaveOffer>) =>
      createSaveOffer(tenantId, newOffer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      toast.success('Offer created successfully', { duration: 2000 });
      closeEditingModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedOffer: SaveOffer) =>
      updateSaveOffer(tenantId, updatedOffer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      toast.success('Offer updated successfully', { duration: 2000 });
      closeEditingModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (offerId: string) => deleteSaveOffer(tenantId, offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      toast.success('Offer deleted successfully', { duration: 2000 });
      closeEditingModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleCreateNewOffer = () => {
    setIsEditModalVisible(true);
  };

  const handleEditOffer = (offer: SaveOffer) => {
    setSelectedOffer(offer);
    setIsEditModalVisible(true);
  };

  const closeEditingModal = () => {
    setIsEditModalVisible(false);
    setSelectedOffer(null);
  };

  const handleDeleteClick = (offer: SaveOffer) => {
    setSelectedOffer(offer);
    setIsDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setSelectedOffer(null);
  };

  const onDelete = (id: string) => {
    setSelectedOffer(null);
    console.log(`Deleting offer with id: ${id}`);
    deleteMutation.mutate(id);
  };

  const onSave = async (offer: Partial<SaveOffer>) => {
    if (offer.id) {
      updateMutation.mutate(offer as SaveOffer);
    } else {
      createMutation.mutate(offer);
    }
  };

  return (
    <div className="h-full w-full pt-8">
      <div className="flex flex-col gap-4">
        <Button onClick={handleCreateNewOffer} className="w-fit">
          <FaPlus /> Create New
        </Button>
        <div className="flex flex-wrap gap-8 py-4">
          {offers.map(offer => (
            <Card
              decoration="left"
              decorationColor="blue"
              key={offer.id}
              className="w-fit max-w-sm"
            >
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-end gap-4 mb-4">
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        color="blue"
                        onClick={() => handleEditOffer(offer)}
                        className="h-6 text-sm"
                      >
                        <FaEdit /> <span>Edit</span>
                      </Button>
                      <Button
                        color="rose"
                        onClick={() => handleDeleteClick(offer)}
                        className="h-6 text-sm"
                      >
                        <FaTrash />
                        <span>Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold leading-6 text-gray-900">
                  {offer.title}
                </h3>
                <div>
                  <p>{offer.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <DeleteModal
        isVisible={isDeleteModalVisible}
        offer={selectedOffer}
        onClose={closeDeleteModal}
        onDelete={onDelete}
      />
      <EditModal
        isVisible={isEditModalVisible}
        offer={selectedOffer}
        onClose={closeEditingModal}
        onSave={onSave}
      />
    </div>
  );
};

export default SaveOffersTab;
