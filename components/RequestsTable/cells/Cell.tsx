// file: components/RequestsTable/Cell.tsx
import { formatDate } from '@/utils/general';
import { User, Network } from 'lucide-react';
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

const UsernameCell: FC<CellProps<Request, string>> = ({ cell }) => {
  const username = cell.getValue();
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-8 h-8 bg-pink-400 rounded-full">
        <User size={16} className="text-white" />
      </div>
      <span>{username}</span>
    </div>
  );
};

const TenantCell: FC<{ name?: string; isLoading: boolean }> = ({
  name,
  isLoading,
}) => {
  if (isLoading) return <Spinner className="p-2" />;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-8 h-8 bg-blue-400 rounded-full">
        <Network size={16} className="text-white" />
      </div>
      <span>{name}</span>
    </div>
  );
};

const RequestTypeCell: FC<CellProps<Request, 'Cancellation'>> = ({ cell }) => {
  const status = cell.getValue();
  const colorMap = {
    Cancellation: 'bg-sky-100 text-sky-800',
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[status]}`}
    >
      {status}
    </span>
  );
};

export { DateCell, UsernameCell, TenantCell, RequestTypeCell };
