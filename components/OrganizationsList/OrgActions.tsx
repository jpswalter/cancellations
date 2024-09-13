import { Button } from '@/components/ui';
import { Organization } from '@/lib/api/organization';
import { FC, useState } from 'react';
import DeleteOrgModal from './DeleteOrgModal';

const OrgActions: FC<{ organization: Organization }> = ({ organization }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <Button color="red" onClick={openDeleteModal}>
        Delete
      </Button>
      <DeleteOrgModal
        isVisible={isDeleteModalOpen}
        orgId={organization.id}
        orgName={organization.name}
        onClose={closeDeleteModal}
      />
    </>
  );
};

export default OrgActions;
