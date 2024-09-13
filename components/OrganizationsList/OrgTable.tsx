import { FC } from 'react';
import DataTable from '@/components/ui/table/table';
import { Row } from '@tanstack/react-table';
import { Loader } from '@/components/ui/spinner';

import { useQuery } from '@tanstack/react-query';
import { getOrganisations, Organization } from '@/lib/api/organization';
import OrgActions from './OrgActions';

const OrgTable: FC = () => {
  const { data: organizations, isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: getOrganisations,
  });

  const columns = [
    {
      header: 'Organization Name',
      accessorKey: 'name',
    },
    {
      header: 'Status',
      cell: ({ row }: { row: Row<Organization> }) => (
        <p className="whitespace-normal break-words">
          {row.original.active ? 'Live' : 'Pending'}
        </p>
      ),
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
      cell: ({ row }: { row: Row<Organization> }) => (
        <p className="whitespace-normal break-words">
          {row.original.requiredCustomerInfo?.join(', ') || '-'}
        </p>
      ),
      size: 200,
    },
    {
      header: 'Connected Organizations',
      accessorKey: 'connectedTenants',
      cell: ({ row }: { row: Row<Organization> }) =>
        row.original.connectedTenants.map(t => t.name).join(', ') || '-',
    },
    {
      header: 'Admin Emails',
      accessorKey: 'adminEmails',
      cell: ({ row }: { row: Row<Organization> }) =>
        row.original.adminEmails?.join(', ') || '-',
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }: { row: Row<Organization> }) => (
        <OrgActions organization={row.original} />
      ),
    },
  ];

  return (
    <div className="p-4 flex flex-col space-y-4 h-full flex-1">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Providers</h2>
          <DataTable
            data={
              organizations?.filter(tenant => tenant.type === 'provider') || []
            }
            columns={columns}
            defaultSort={[{ id: 'name', desc: false }]}
          />

          <h2 className="text-2xl font-bold mt-8">Proxies</h2>
          <DataTable
            data={
              organizations?.filter(tenant => tenant.type === 'proxy') || []
            }
            columns={columns}
            defaultSort={[{ id: 'name', desc: false }]}
          />
        </div>
      )}
    </div>
  );
};

export default OrgTable;
