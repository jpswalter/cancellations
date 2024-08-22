// file: components/ResolvedList/ResolvedTable.tsx
'use client';
import React, { FC, useState } from 'react';
import { Request, RequestStatus as RequestStatusType } from '@/lib/db/schema';
import { Cell } from '@tanstack/react-table';
import { useAuth } from '@/hooks/useAuth';
import { DateCell, TenantCell } from '../RequestsTable/cells/Cell';
import { getTenants } from '@/lib/api/tenant';
import { useQuery } from '@tanstack/react-query';
import RequestDrawer from '../RequestDetails/RequestDrawer';
import EmptyRequestsState from '../RequestsTable/EmptyTable';
import { generateCustomerInfoColumns } from '../RequestsTable/table.utils';
import RequestStatus from '../RequestStatus/RequestStatus';
import DataTable, { CustomColumnDef } from '@/components/ui/table';
import RequestRow from '../RequestsTable/Row';
interface Props {
  requests: Request[];
  EmptyComponent?: React.ComponentType;
  defaultSort: { id: string; desc: boolean }[];
}

const RequestsTable: FC<Props> = ({
  requests,
  EmptyComponent = EmptyRequestsState,
  defaultSort,
}) => {
  const { userData } = useAuth();
  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
  });
  const isProviderUser = userData?.tenantType === 'provider';
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const toggleDrawer = (request: Request) => {
    setIsDrawerOpen(prev => !prev);
    if (request) {
      setSelectedRequest(request);
    } else {
      setSelectedRequest(null);
    }
  };

  const customerInfoColumns = generateCustomerInfoColumns(requests);
  const columns: CustomColumnDef<Request>[] = [
    {
      header: 'Status',
      meta: {
        className: 'text-center',
      },
      accessorKey: 'status',
      cell: ({ cell }: { cell: Cell<Request, RequestStatusType> }) => (
        <RequestStatus status={cell.getValue()} />
      ),
      size: 130,
    },
    ...customerInfoColumns,
    {
      header: isProviderUser ? 'Source' : 'Destination',
      accessorKey: isProviderUser ? 'proxyTenantId' : 'providerTenantId',
      cell: ({ cell }: { cell: Cell<Request, string> }) => {
        const name = tenants?.find(
          tenant => tenant.id === cell.getValue(),
        )?.name;
        return <TenantCell name={name} isLoading={tenantsLoading} />;
      },
    },
    {
      header: 'Submitted by',
      accessorKey: 'submittedBy',
    },
    {
      header: 'Last Update',
      accessorKey: 'dateResponded',
      cell: DateCell,
    },
    {
      header: 'Save Offer',
      accessorKey: 'saveOffer.title',
    },
  ];

  if (!userData) return null;

  if (requests.length === 0) {
    return <EmptyComponent />;
  }

  return (
    <>
      <DataTable
        data={requests}
        columns={columns}
        defaultSort={defaultSort}
        EmptyComponent={EmptyComponent}
        onRowClick={toggleDrawer}
        RowComponent={RequestRow}
      />
      <RequestDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        request={selectedRequest}
      />
    </>
  );
};

export default RequestsTable;
