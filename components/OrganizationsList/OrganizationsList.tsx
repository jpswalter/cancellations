'use client';

import React, { FC, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import CreateOrganizationModal from './CreateOrganizationModal';
import OrgTable from './OrgTable';

const OrganisationsList: FC = () => {
  const { userData } = useAuth();

  const [isCreateOrganizationModalOpen, setIsCreateOrganizationModalOpen] =
    useState(false);

  const openModal = () => {
    setIsCreateOrganizationModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateOrganizationModalOpen(false);
  };

  if (!userData) return null;

  return (
    <div className="flex w-full">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="flex h-[72px] flex-none items-center justify-between gap-2 border-b bg-white px-[20px]">
          <Button onClick={openModal} color="blue">
            Add Organization
          </Button>
        </div>
        <OrgTable />

        <CreateOrganizationModal
          isOpen={isCreateOrganizationModalOpen}
          closeModal={closeModal}
        />
      </div>
    </div>
  );
};

export default OrganisationsList;
