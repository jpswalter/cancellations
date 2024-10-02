// file: components/RequestsTable/RequestsTable.tsx
'use client';
import React, { FC, useState } from 'react';
import {
  Request,
  RequestSaveOffer,
  RequestStatus as RequestStatusType,
  RequestType,
} from '@/lib/db/schema';
import { Row, Cell, VisibilityState } from '@tanstack/react-table';
import { useAuth } from '@/hooks/useAuth';
import SaveOfferCell from '@/components/RequestsTable/cells/SaveOfferCell';
import { generateCustomerInfoColumns } from './table.utils';
import RequestStatus from '../RequestStatus/RequestStatus';
import EmptyRequestsState from './EmptyTable';
import CTACell from './cells/CTACell';
import RequestDrawer from '../RequestDetails/RequestDrawer';
import DataTable from '../ui/table/table';
import ActionsCell from './cells/ActionsCell';
import { Loader } from '../ui/spinner';
import { getTenants } from '@/lib/api/tenant';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

interface Props {
  requests: Request[];
  EmptyComponent?: React.ComponentType;
  isActionsTable?: boolean;
  defaultSort: { id: string; desc: boolean }[];
  isLoading?: boolean;
}

const RequestsTable: FC<Props> = ({
  requests,
  EmptyComponent = EmptyRequestsState,
  isActionsTable,
  defaultSort,
  isLoading,
}) => {
  const { userData } = useAuth();
  const tenantId = userData?.tenantId;
  const isProviderUser = userData?.tenantType === 'provider';
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [drawerPosition, setDrawerPosition] = useState<'left' | 'right'>(
    'right',
  );

  const { data: tenant } = useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
    select: tenants => tenants.find(tenant => tenant.id === tenantId),
  });

  const toggleDrawer = (request: Request, position?: 'left' | 'right') => {
    if (position) {
      setDrawerPosition(position);
    } else {
      setDrawerPosition('right');
    }
    setIsDrawerOpen(prev => !prev);
    if (request) {
      setSelectedRequest(request);
    } else {
      setSelectedRequest(null);
    }
  };

  const customerInfoColumns = generateCustomerInfoColumns(requests);
  const columns = [
    ...(isActionsTable && !isProviderUser
      ? [
          {
            header: '',
            accessorKey: 'id',
            meta: {
              className: 'flex justify-center',
            },
            cell: ({ row }: { row: Row<Request> }) => (
              <CTACell row={row} toggleDrawer={toggleDrawer} />
            ),
          },
        ]
      : []),
    {
      header: 'Type',
      accessorKey: 'requestType',
      meta: {
        className: 'text-center',
      },
      cell: ({ cell }: { cell: Cell<Request, RequestType> }) => (
        <Badge color={cell.getValue() === 'Cancellation' ? 'red' : 'amber'}>
          {cell.getValue()}
        </Badge>
      ),
      size: 120,
    },
    {
      header: 'Status',
      meta: {
        className: 'flex justify-center',
      },
      accessorKey: 'status',
      cell: ({ cell }: { cell: Cell<Request, RequestStatusType> }) => (
        <RequestStatus status={cell.getValue()} className="w-full" />
      ),
      size: 120,
    },
    ...customerInfoColumns,
    ...(isProviderUser
      ? [
          {
            id: 'Actions',
            header: 'Actions',
            cell: ({ row }: { row: Row<Request> }) => (
              <ActionsCell
                row={row}
                tenantHasSaveOffers={
                  tenant !== undefined && Number(tenant?.saveOffers?.length) > 0
                }
              />
            ),
          },
        ]
      : []),
    ...(isProviderUser
      ? [
          {
            header: 'Save Offer Status',
            accessorKey: 'saveOffer',
            cell: ({
              row,
            }: {
              row: Row<Request>;
              cell: Cell<Request, RequestSaveOffer>;
            }) => <SaveOfferCell row={row} />,
          },
        ]
      : []),
    {
      id: 'dateResponded',
      accessorKey: 'dateResponded',
      header: 'Date Responded',
    },
  ];

  const columnVisibility: VisibilityState = {
    dateResponded: false,
  };

  if (!userData) return null;

  if (requests.length === 0) {
    return <EmptyComponent />;
  }

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <DataTable
          data={requests}
          columns={columns}
          defaultSort={defaultSort}
          EmptyComponent={EmptyComponent}
          onRowClick={toggleDrawer}
          columnVisibility={columnVisibility}
        />
      )}

      <RequestDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        request={selectedRequest}
        drawerPosition={drawerPosition}
      />
    </>
  );
};

export default RequestsTable;
