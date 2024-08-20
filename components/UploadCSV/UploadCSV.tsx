'use client';
import { FC } from 'react';
import FileUpload from './FileUpload';
import UploadTable from './UploadTable';

const UploadCSV: FC = () => {
  return (
    <div className="flex w-full">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="flex h-[72px] flex-none items-center gap-2 border-b bg-white px-[20px]">
          <h1 className="truncate">Upload CSV</h1>
        </div>

        <div className="p-4 flex flex-col space-y-4">
          <FileUpload />
          <UploadTable />
        </div>
      </div>
    </div>
  );
};

export default UploadCSV;
