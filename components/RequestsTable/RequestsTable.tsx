// file: components/RequestsTable/RequestsTable.tsx
'use client';
import React, { FC, useState } from 'react';
import {
  Request,
  RequestStatus as RequestStatusType,
  Tenant,
} from '@/lib/db/schema';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  Row,
  Cell,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useAuth } from '@/hooks/useAuth';
import {
  DateCell,
  ResolveCell,
  RequestTypeCell,
  DeclineReasonCell,
  TenantCell,
} from './cells/Cell';
import SaveOfferCell from './cells/SaveOfferCell';
import ReportButton from './ReportButton';
import RequestRow from './Row';
import { generateCustomerInfoColumns } from './table.utils';
import clsx from 'clsx';
import RequestStatus from '../RequestStatus/RequestStatus';
import EmptyRequestsState from './EmptyTable';
import { FaCheckCircle } from 'react-icons/fa';
import { FaCircleXmark } from 'react-icons/fa6';
import { getTenants } from '@/lib/api/tenant';
import { useQuery } from '@tanstack/react-query';
import { CustomColumnMeta } from '@/constants/app.types';
import CTACell from './cells/CTACell';
import { TablePagination } from '@/components/ui/pagination';
import RequestDrawer from '../RequestDetails/RequestDrawer';

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
      }: {
        getValue: () => string;
        cell: Cell<Request, boolean>;
        row: Row<Request>;
      }) => {
        if (isProviderUser) {
          return <ResolveCell cell={cell} />;
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
            <DeclineReasonCell cell={cell} provider={provider as Tenant} />
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

  const paginationSettings = {
    pageIndex: 0,
    pageSize: 10,
  };
  const [pagination, setPagination] = useState(paginationSettings);
  const shouldRenderPagination = requests.length > paginationSettings.pageSize;

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting: defaultSort,
      pagination,
    },
    onPaginationChange: setPagination,
  });

  if (!userData) return null;

  if (requests.length === 0) {
    return <EmptyComponent />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="border-b border-gray-200">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const meta = header.column.columnDef.meta as CustomColumnMeta;
                  const isHighlightable = meta?.isHighlightable;
                  const width = header.column.getSize();
                  const headerClassName = clsx(
                    'p-4 whitespace-nowrap',
                    {
                      'bg-yellow-50': isHighlightable,
                    },
                    meta?.className ?? 'text-left',
                  );
                  return (
                    <th
                      key={header.id}
                      className={headerClassName}
                      style={{ minWidth: `${width}px` }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <RequestRow key={row.id} row={row} toggleDrawer={toggleDrawer} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full mt-4">
        {shouldRenderPagination && (
          <TablePagination
            currentPage={pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            onPageChange={page => table.setPageIndex(page - 1)}
          />
        )}
      </div>
      <RequestDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        request={selectedRequest}
      />
    </div>
  );
};

export default RequestsTable;
