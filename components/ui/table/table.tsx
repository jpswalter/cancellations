import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  VisibilityState,
  PaginationState,
} from '@tanstack/react-table';
import { TablePagination } from '../pagination';
import RequestRow from './table-row';
import { Request } from '@/lib/db/schema';
import { TableRowAnimationProvider } from './animation-context';
import SortableHeader from './table-header';

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

const GenericTable = <T extends Request>({
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
  const [sorting, setSorting] = useState(defaultSort);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      pagination,
      columnVisibility,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getRowId: row => row.id,
  });

  if (data.length === 0 && EmptyComponent) {
    return <EmptyComponent />;
  }

  return (
    <TableRowAnimationProvider>
      <div className="grid gap-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="divide-y divide-gray-200">
            <thead className="border-b border-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <SortableHeader key={header.id} header={header} />
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
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
    </TableRowAnimationProvider>
  );
};

export default GenericTable;
