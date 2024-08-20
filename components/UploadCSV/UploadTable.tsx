import { FC, useMemo } from 'react';
import { useUpload } from './UploadCSVProvider/upload.hooks';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { getDisplayHeader } from '@/utils/template.utils';
import SubmitDataButton from './SubmitDataButton';

const UploadTable: FC = () => {
  const { csv } = useUpload();

  const columns = useMemo(() => {
    if (!csv || csv.headers.length === 0) return [];
    const columnHelper = createColumnHelper<Record<string, string>>();
    return csv.headers.map(header =>
      columnHelper.accessor(header, {
        header: getDisplayHeader(header),
        cell: info => info.getValue(),
      }),
    );
  }, [csv]);

  const table = useReactTable({
    data: csv?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!csv || csv.status === 'error') {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <div className="w-full flex gap-4 items-center justify-center p-4 border-dashed border-2 border-gray-300 rounded-lg mb-4">
        <h3 className="text-gray-700 text-xl">
          You are about to upload {csv.data.length} requests.
        </h3>
        <SubmitDataButton />
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
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
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
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

export default UploadTable;
