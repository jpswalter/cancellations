import React from 'react';
import { Row, flexRender } from '@tanstack/react-table';
import { useForm, FormProvider } from 'react-hook-form';
import { CustomColumnMeta } from '@/components/ui/table/table';
import clsx from 'clsx';
import { useTableRowAnimation } from './animation-context';
import { Request } from '@/lib/db/schema';

interface RequestRowProps<T> {
  row: Row<T>;
  toggleDrawer: (data: T) => void;
}

const RequestRow = <T extends Request>({
  row,
  toggleDrawer,
}: RequestRowProps<T>) => {
  const methods = useForm();
  const { closingRowId } = useTableRowAnimation();
  const isClosing = closingRowId === row.original.id;

  const handleRowClick = () => {
    toggleDrawer(row.original);
  };

  return (
    <FormProvider {...methods}>
      <tr
        className={`border-b border-gray-200 cursor-pointer overflow-hidden transition-all duration-300 ease-out ${
          isClosing
            ? 'transform scale-y-0 h-0 bg-red-100'
            : 'transform scale-y-100'
        }`}
        onClick={handleRowClick}
      >
        {row.getVisibleCells().map(cell => {
          const meta = cell.column.columnDef.meta as CustomColumnMeta;
          const width = cell.column.getSize();
          const cellClassName = clsx(
            `p-4 whitespace-nowrap`,
            {
              'bg-yellow-50': meta?.isHighlightable,
              'sticky right-0 z-10 bg-white': meta?.isSticky,
              'before:absolute before:content-[""] before:top-0 before:left-0 before:w-4 before:h-full before:shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)] before:z-[-1]':
                meta?.isSticky,
            },
            meta?.className ?? 'text-left',
          );
          return (
            <td
              key={cell.id}
              className={cellClassName}
              style={{
                minWidth: `${width}px`,
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          );
        })}
      </tr>
    </FormProvider>
  );
};

export default RequestRow;
