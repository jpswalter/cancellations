// file: components/RequestsTable/RequestsTable.tsx
'use client';
import React, { FC, useState } from 'react';
import {
  Request,
  RequestStatus as RequestStatusType,
  Tenant,
} from '@/lib/db/schema';
import { Row, Cell } from '@tanstack/react-table';
import { useAuth } from '@/hooks/useAuth';
import { DateCell, RequestTypeCell, TenantCell } from './cells/Cell';
import DeclineReasonCell from '@/components/RequestsTable/cells/DeclineReasonCell';
import ResolveCell from '@/components/RequestsTable/cells/ResolveCell';
import SaveOfferCell from '@/components/RequestsTable/cells/SaveOfferCell';
import ReportButton from './ReportButton';
import RequestRow from './Row';
import { generateCustomerInfoColumns } from './table.utils';
import RequestStatus from '../RequestStatus/RequestStatus';
import EmptyRequestsState from './EmptyTable';
import { FaCheckCircle } from 'react-icons/fa';
import { FaCircleXmark } from 'react-icons/fa6';
import { getTenants } from '@/lib/api/tenant';
import { useQuery } from '@tanstack/react-query';
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
  const columns = [
    ...(isActionsTable
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
      header: 'Request Type',
      accessorKey: 'requestType',
      meta: {
        className: 'text-center',
      },
      cell: RequestTypeCell,
    },
    {
      header: 'Last Update',
      accessorKey: 'dateResponded',
      cell: DateCell,
    },
    ...customerInfoColumns,
    ...(isProviderUser
      ? [
          {
            header: 'Save Offer',
            accessorKey: 'saveOffer',
            cell: SaveOfferCell,
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
        getValue,
        cell,
        row,
      }: {
        getValue: () => string;
        cell: Cell<Request, boolean>;
        row: Row<Request>;
      }) => {
        if (isProviderUser) {
          return <ResolveCell cell={cell} row={row} />;
        }
        const value = getValue();
        if (value === null) {
          return null; // Return null for empty cell
        }
        return (
          <div className="flex justify-center items-center w-full h-full">
            {value ? (
              <FaCheckCircle className="text-green-500 text-2xl" />
            ) : (
              <FaCircleXmark className="text-red-500 text-2xl" />
            )}
          </div>
        );
      },
    },

    {
      header: 'Decline Reason',
      accessorKey: 'declineReason',
      cell: ({
        getValue,
        cell,
        row,
      }: {
        getValue: () => string;
        cell: Cell<Request, string>;
        row: Row<Request>;
      }) => {
        if (isProviderUser) {
          const provider = tenants?.find(
            tenant => tenant.id === row.original.providerTenantId,
          );
          return (
            <DeclineReasonCell
              cell={cell}
              provider={provider as Tenant}
              row={row}
            />
          );
        }

        return getValue();
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
      <div className="h-full">
        <DataTable
          data={requests}
          columns={columns}
          defaultSort={defaultSort}
          EmptyComponent={EmptyComponent}
          onRowClick={toggleDrawer}
          RowComponent={RequestRow}
        />
      </div>
      <RequestDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        request={selectedRequest}
      />
    </>
  );
};

export default RequestsTable;
