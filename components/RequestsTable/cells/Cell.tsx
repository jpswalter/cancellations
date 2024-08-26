// file: components/RequestsTable/Cell.tsx
import { formatDate } from '@/utils/general';
import { Cell, Row } from '@tanstack/react-table';
import { Request } from '@/lib/db/schema';
import { FC } from 'react';
import Spinner from '../../ui/spinner';

export type CellProps<R, T> = {
  cell: Cell<R, T>;
  row?: Row<R>;
};

const DateCell: FC<CellProps<Request, string>> = ({ cell }) => {
  const date = cell.getValue();
  return formatDate(date);
};

const TenantCell: FC<{ name?: string; isLoading: boolean }> = ({
  name,
  isLoading,
}) => {
  if (isLoading) return <Spinner className="p-2" />;

  return (
    <div className="flex items-center gap-2">
      <div className="text-lg bg-blue-100 text-blue-600 p-2 rounded-full w-6 h-6 flex items-center justify-center">
        {name?.toUpperCase().slice(0, 1)}
      </div>
      <span>{name}</span>
    </div>
  );
};

export { DateCell, TenantCell };
