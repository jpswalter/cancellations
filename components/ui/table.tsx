import React, { useState } from 'react';
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  Row,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { TablePagination } from './pagination';

export type CustomColumnMeta = {
  isCustomerInfo?: boolean;
  isHighlightable?: boolean;
  className?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CustomColumnDef<T> = ColumnDef<T, any> & {
  meta?: CustomColumnMeta;
};

interface GenericTableProps<T> {
  data: T[];
  columns: CustomColumnDef<T>[];
  defaultSort?: { id: string; desc: boolean }[];
  EmptyComponent?: React.ComponentType;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  RowComponent?: React.ComponentType<{
    row: Row<T>;
    toggleDrawer: (data: T) => void;
  }>;
}

const GenericTable = <T extends object>({
  data,
  columns,
  defaultSort = [],
  EmptyComponent,
  onRowClick,
  pageSize = 10,
  RowComponent,
}: GenericTableProps<T>) => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const table = useReactTable({
    data,
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

  if (data.length === 0 && EmptyComponent) {
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
            {table.getRowModel().rows.map(row =>
              RowComponent ? (
                <RowComponent
                  key={row.id}
                  row={row}
                  toggleDrawer={() => onRowClick && onRowClick(row.original)}
                />
              ) : (
                <tr
                  key={row.id}
                  className={clsx('hover:bg-gray-50', {
                    'cursor-pointer': !!onRowClick,
                  })}
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      {data.length > pageSize && (
        <TablePagination
          currentPage={pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          onPageChange={page => table.setPageIndex(page - 1)}
        />
      )}
    </div>
  );
};

export default GenericTable;
