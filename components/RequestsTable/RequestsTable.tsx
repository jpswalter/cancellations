// file: components/RequestsTable/RequestsTable.tsx
'use client';
import React, { FC, useState } from 'react';
import {
  Request,
  RequestSaveOffer,
  RequestStatus as RequestStatusType,
} from '@/lib/db/schema';
import { Row, Cell } from '@tanstack/react-table';
import { useAuth } from '@/hooks/useAuth';
import ResolveCell from '@/components/RequestsTable/cells/ResolveCell';
import SaveOfferCell from '@/components/RequestsTable/cells/SaveOfferCell';
import ReportButton from './ReportButton';
import RequestRow from './Row';
import { generateCustomerInfoColumns } from './table.utils';
import RequestStatus from '../RequestStatus/RequestStatus';
import EmptyRequestsState from './EmptyTable';
import CTACell from './cells/CTACell';
import RequestDrawer from '../RequestDetails/RequestDrawer';
import DataTable from '../ui/table';

interface Props {
  requests: Request[];
  EmptyComponent?: React.ComponentType;
  isActionsTable?: boolean;
  defaultSort: { id: string; desc: boolean }[];
}

const RequestsTable: FC<Props> = ({
  requests,
  EmptyComponent = EmptyRequestsState,
  isActionsTable,
  defaultSort,
}) => {
  const { userData } = useAuth();

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
  const columns = [
    ...(isActionsTable && !isProviderUser
      ? [
          {
            header: '',
            accessorKey: 'id',
            cell: ({ row }: { row: Row<Request> }) => (
              <CTACell row={row} toggleDrawer={toggleDrawer} />
            ),
          },
        ]
      : []),
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
    ...(isProviderUser
      ? [
          {
            header: 'Save Offer',
            accessorKey: 'saveOffer',
            cell: ({
              row,
            }: {
              row: Row<Request>;
              cell: Cell<Request, RequestSaveOffer>;
            }) => <SaveOfferCell row={row} toggleDrawer={toggleDrawer} />,
          },
        ]
      : []),
    {
      header: 'Successfully Resolved',
      meta: {
        className: 'text-center',
      },
      accessorKey: 'successfullyResolved',
      cell: ({
        cell,
        row,
      }: {
        getValue: () => string;
        cell: Cell<Request, boolean>;
        row: Row<Request>;
      }) => {
        return (
          <ResolveCell cell={cell} row={row} isProviderUser={isProviderUser} />
        );
      },
    },
    ...(isProviderUser
      ? [
          {
            id: 'Actions',
            cell: ({ row }: { row: Row<Request> }) => (
              <div onClick={e => e.stopPropagation()}>
                <ReportButton request={row.original} />
              </div>
            ),
          },
        ]
      : []),
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
