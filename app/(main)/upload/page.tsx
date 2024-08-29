import { UploadCSVProvider } from '@/components/UploadCSV/UploadCSVProvider/UploadCSVProvider';
import { Metadata } from 'next';
import UploadCSV from '@/components/UploadCSV/UploadCSV';

export const metadata: Metadata = {
  title: 'ProxyLink | Upload CSV',
};

export default function UploadPage() {
  return (
    <UploadCSVProvider>
      <UploadCSV />
    </UploadCSVProvider>
  );
}
