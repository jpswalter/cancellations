'use client';

import React, { FC } from 'react';
import { TenantStats } from '@/app/api/orgstats/route';
import { Row, VisibilityState } from '@tanstack/react-table';
import { useAuth } from '@/hooks/useAuth';
import DataTable from '../ui/table/table';
import { Loader } from '../ui/spinner';
import { useQuery } from '@tanstack/react-query';

const getOrgStats = async (): Promise<TenantStats[]> => {
  const response = await fetch('/api/orgstats');
  if (!response.ok) {
    throw new Error('Failed to fetch organization stats');
  }
  return response.json();
};

const OrganisationsList: FC = () => {
  const { userData } = useAuth();

  const { data: orgStats, isLoading: isLoadingTenants } = useQuery<
    TenantStats[]
  >({
    queryKey: ['orgstats'],
    queryFn: getOrgStats,
  });

  const columns = [
    {
      header: 'Organization Name',
      accessorKey: 'name',
    },
    {
      header: 'User Count',
      accessorKey: 'userCount',
    },
    {
      header: 'Request Count',
      accessorKey: 'requestCount',
    },
    {
      header: 'Authenticating Fields',
      accessorKey: 'requiredCustomerInfo',
      cell: ({ row }: { row: Row<TenantStats> }) => (
        <p className="whitespace-normal break-words">
          {row.original.requiredCustomerInfo?.join(', ') || '-'}
        </p>
      ),
      size: 200,
    },
    {
      header: 'Connected Organizations',
      accessorKey: 'connectedTenants',
      cell: ({ row }: { row: Row<TenantStats> }) =>
        row.original.connectedTenants.map(t => t.name).join(', ') || '-',
    },
    {
      header: 'Admin Emails',
      accessorKey: 'adminEmails',
      cell: ({ row }: { row: Row<TenantStats> }) =>
        row.original.adminEmails.join(', ') || '-',
    },
  ];

  const columnVisibility: VisibilityState = {};

  if (!userData) return null;

  return (
    <div className="flex w-full">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="flex h-[72px] flex-none items-center justify-between gap-2 border-b bg-white px-[20px]"></div>
        <div className="p-4 flex flex-col space-y-4 h-full flex-1">
          {isLoadingTenants ? (
            <Loader />
          ) : (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Providers</h2>
              <DataTable
                data={
                  orgStats?.filter(tenant => tenant.type === 'provider') || []
                }
                columns={columns}
                columnVisibility={columnVisibility}
              />

              <h2 className="text-2xl font-bold mt-8">Proxies</h2>
              <DataTable
                data={orgStats?.filter(tenant => tenant.type === 'proxy') || []}
                columns={columns}
                columnVisibility={columnVisibility}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganisationsList;
