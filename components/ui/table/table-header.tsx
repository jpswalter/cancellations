import React from 'react';
import { flexRender, Header } from '@tanstack/react-table';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import clsx from 'clsx';
import { CustomColumnMeta } from './table';

interface SortableHeaderProps<T> {
  header: Header<T, unknown>;
}

const SortableHeader = <T,>({ header }: SortableHeaderProps<T>) => {
  const isSorted = header.column.getIsSorted();
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
      className={headerClassName}
      style={{
        minWidth: `${width}px`,
      }}
      onClick={header.column.getToggleSortingHandler()}
    >
      <div className="w-full flex items-center justify-around cursor-pointer">
        {flexRender(header.column.columnDef.header, header.getContext())}
        {isSorted ? (
          isSorted === 'asc' ? (
            <FaSortUp className="ml-2" />
          ) : (
            <FaSortDown className="ml-2" />
          )
        ) : (
          <FaSort className="ml-2 opacity-30" />
        )}
      </div>
    </th>
  );
};

export default SortableHeader;
