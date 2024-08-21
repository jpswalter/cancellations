// file: components/RequestsTable/RequestRow.tsx
import React from 'react';
import { Row, flexRender } from '@tanstack/react-table';
import { Request } from '@/lib/db/schema';
import { useForm, FormProvider } from 'react-hook-form';
import { CustomColumnMeta } from '@/components/ui/table';
import clsx from 'clsx';

interface RequestRowProps {
  row: Row<Request>;
  toggleDrawer: (request: Request) => void;
}

const RequestRow: React.FC<RequestRowProps> = ({ row, toggleDrawer }) => {
  const methods = useForm();

  const handleRowClick = () => {
    toggleDrawer(row.original);
  };

  return (
    <FormProvider {...methods}>
      <tr
        className="border-b border-gray-200 cursor-pointer"
        onClick={handleRowClick}
      >
        {row.getVisibleCells().map(cell => {
          const meta = cell.column.columnDef.meta as CustomColumnMeta;
          const isHighlightable = meta?.isHighlightable;
          const width = cell.column.getSize();
          const cellClassName = clsx(
            `p-4 whitespace-nowrap`,
            {
              'bg-yellow-50': isHighlightable,
            },
            meta?.className ?? 'text-left',
          );
          return (
            <td
              key={cell.id}
              className={cellClassName}
              style={{ minWidth: `${width}px` }}
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
