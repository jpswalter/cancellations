import React, { useState } from 'react';
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  VisibilityState,
  PaginationState,
  Row,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { TablePagination } from './pagination';
import RequestRow from '../RequestsTable/Row'; // Import the default RowComponent

export type CustomColumnMeta = {
  isCustomerInfo?: boolean;
  isHighlightable?: boolean;
  className?: string;
  isSticky?: boolean;
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
  columnVisibility?: VisibilityState;
}

const GenericTable = <T extends object>({
  data,
  columns,
  defaultSort = [],
  EmptyComponent,
  onRowClick,
  pageSize = 10,
  columnVisibility,
}: GenericTableProps<T>) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting: defaultSort,
      pagination,
      columnVisibility,
    },
    onPaginationChange: setPagination,
  });

  if (data.length === 0 && EmptyComponent) {
    return <EmptyComponent />;
  }

  return (
    <div className="grid gap-4 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="divide-y divide-gray-200">
          <thead className="border-b border-gray-200">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const meta = header.column.columnDef.meta as CustomColumnMeta;
                  const width = header.column.getSize();
                  const headerClassName = clsx(
                    'p-4 whitespace-nowrap',
                    {
                      'bg-yellow-50': meta?.isHighlightable,
                      'sticky right-0 z-10 bg-white': meta?.isSticky,
                      'before:absolute before:content-[""] before:top-0 before:left-0 before:w-4 before:h-full before:shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)] before:z-[-1]':
                        meta?.isSticky,
                    },
                    meta?.className ?? 'text-left',
                  );
                  return (
                    <th
                      key={header.id}
                      className={headerClassName}
                      style={{
                        minWidth: `${width}px`,
                      }}
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
            {table.getRowModel().rows.map((row: Row<T>) => (
              <RequestRow
                key={row.id}
                row={row}
                toggleDrawer={() => onRowClick && onRowClick(row.original)}
              />
            ))}
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
