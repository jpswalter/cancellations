// file: components/RequestsTable/RequestsTable.tsx
'use client';
import { FC } from 'react';
import { Request } from '@/lib/db/schema';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  Row,
} from '@tanstack/react-table';
import { useAuth } from '@/hooks/useAuth';
import StatusCell from './StatusCell';
import RequestTypeCell from './RequestTypeCell';

import { DateCell, SourceCell, UsernameCell, ResolveCell } from './Cell';
import EmptyRequestsState from './EmptyTable';
import ReportButton from './ReportButton';
interface Props {
  requests: Request[];
}

const RequestsTable: FC<Props> = ({ requests }) => {
  const { userData } = useAuth();
  const isProviderUser = userData?.tenantType === 'provider';

  const handleSubmitReport = async (request: Request) => {
    console.log(request);
  };

  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: StatusCell,
    },
    ...(isProviderUser
      ? [
          {
            header: 'Source',
            accessorKey: 'proxyTenantId',
            cell: SourceCell,
          },
        ]
      : []),
    {
      header: 'Submitted by',
      accessorKey: 'submittedBy',
    },
    {
      header: 'Request Type',
      accessorKey: 'requestType',
      cell: RequestTypeCell,
    },
    {
      header: 'Date Submitted',
      accessorKey: 'dateSubmitted',
      cell: DateCell,
    },
    {
      header: 'Date Responded',
      accessorKey: 'dateResponded',
      cell: DateCell,
    },
    {
      header: 'Customer Name',
      accessorKey: 'customerName',
      cell: UsernameCell,
    },
    {
      header: 'Customer Email',
      accessorKey: 'customerEmail',
    },
    {
      header: 'Account Number',
      accessorKey: 'accountNumber',
    },
    {
      header: 'Last 4 CC Digits',
      accessorKey: 'lastFourCCDigits',
    },
    ...(isProviderUser
      ? [
          {
            header: 'Successfully Resolved',
            accessorKey: 'successfullyResolved',
            cell: ResolveCell,
          },
        ]
      : []),
    {
      header: 'Rescue Offer',
      accessorKey: 'rescueOffer',
    },
    {
      header: 'Decline Reason',
      accessorKey: 'declineReason',
    },
    {
      header: 'Notes',
      accessorKey: 'notes',
    },
    ...(isProviderUser
      ? [
          {
            id: 'Actions',
            cell: ({ row }: { row: Row<Request> }) => (
              <ReportButton
                request={row.original}
                handleSubmitReport={handleSubmitReport}
              />
            ),
          },
        ]
      : []),
  ];

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (requests.length === 0) {
    return <EmptyRequestsState />;
  }

  return (
    <div className="overflow-x-auto">
      <table>
        <thead className="border-b border-gray-200">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="p-4 whitespace-nowrap text-left">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-b border-gray-200">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsTable;
