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
    <div className="flex w-full bg-gray-50">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-semibold text-gray-900">
              Organizations
            </h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-900">
                Organization List
              </h2>
              <Button onClick={openModal} color="blue">
                Add Organization
              </Button>
            </div>
            <OrgTable />
          </div>
        </div>

        <CreateOrganizationModal
          isOpen={isCreateOrganizationModalOpen}
          closeModal={closeModal}
        />
      </div>
    </div>
  );
};

export default OrganisationsList;
