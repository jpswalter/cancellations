// file: components/ResolvedList/ResolvedTable.tsx
'use client';
import React, { FC, useState } from 'react';
import { Request, RequestStatus as RequestStatusType } from '@/lib/db/schema';
import {
  useReactTable,
  flexRender,
  Cell,
  getSortedRowModel,
  getCoreRowModel,
} from '@tanstack/react-table';
import { useAuth } from '@/hooks/useAuth';
import {
  DateCell,
  RequestTypeCell,
  TenantCell,
} from '../RequestsTable/cells/Cell';
import { CustomColumnMeta } from '@/constants/app.types';
import { getTenants } from '@/lib/api/tenant';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import RequestDrawer from '../RequestDetails/RequestDrawer';
import SaveOfferCell from '../RequestsTable/cells/SaveOfferCell';
import EmptyRequestsState from '../RequestsTable/EmptyTable';
import RequestRow from '../RequestsTable/Row';
import { generateCustomerInfoColumns } from '../RequestsTable/table.utils';
import RequestStatus from '../RequestStatus/RequestStatus';

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
  const columns = [
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
      header: 'Request Type',
      accessorKey: 'requestType',
      meta: {
        className: 'text-center',
      },
      cell: RequestTypeCell,
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
    ...customerInfoColumns,
    {
      header: 'Save Offer',
      accessorKey: 'saveOffer',
      cell: SaveOfferCell,
    },
  ];

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: defaultSort,
    },
  });

  if (!userData) return null;

  if (requests.length === 0) {
    return <EmptyComponent />;
  }

  return (
    <div className="overflow-x-auto h-full">
      <table className="w-full border-collapse table-auto">
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
      <RequestDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        request={selectedRequest}
      />
    </div>
  );
};

export default RequestsTable;
