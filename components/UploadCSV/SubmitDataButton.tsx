import { useUpload } from './UploadCSVProvider/upload.hooks';
import { CURRENT_SCHEMA_VERSION, Request } from '../../lib/db/schema';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postRequests } from '@/lib/api/request';

const SubmitDataButton = () => {
  const queryClient = useQueryClient();
  const {
    csv,
    resetCsvFile,
    setUploadedFilename,
    setSelectedProvider,
    selectedProviderId,
    selectedRequestType,
  } = useUpload();
  const { userData } = useAuth();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: postRequests,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      resetCsvFile();
      setUploadedFilename(undefined);
      setSelectedProvider(undefined);
      router.push('/requests');
    },
    onError: error => {
      console.error('Error submitting data:', error);
    },
  });

  const handleSubmit = () => {
    const isDisabled =
      !csv || csv.data.length === 0 || !selectedProviderId || !userData?.email;

    if (isDisabled) {
      return;
    }

    const requests: Omit<Request, 'id' | 'logId'>[] = csv.data.map(row => {
      const customerInfo: { [key: string]: string } = {};
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          customerInfo[key] = row[key] || '';
        }
      }

      return {
        version: CURRENT_SCHEMA_VERSION,
        status: 'Pending',
        submittedBy: userData.email,
        requestType: selectedRequestType,
        dateSubmitted: new Date().toISOString(),
        dateResponded: new Date().toISOString(),
        proxyTenantId: userData.tenantId,
        providerTenantId: selectedProviderId,
        customerInfo,
        notes: null,
        successfullyResolved: null,
        saveOffer: null,
        declineReason: null,
      };
    });

    mutation.mutate(requests);
  };

  if (!csv || !selectedProviderId || csv.data.length === 0) {
    return null;
  }

  return (
    <div>
      <Button
        onClick={handleSubmit}
        disabled={mutation.isPending}
        className={`ml-2 font-bold py-2 px-4 rounded ${
          mutation.isPending
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-700 text-white'
        }`}
      >
        {mutation.isPending ? 'Uploading...' : 'Upload Data'}
      </Button>
      {mutation.isSuccess && (
        <p className="text-green-500 mt-2">Data submitted successfully!</p>
      )}
      {mutation.isError && (
        <p className="text-red-500 mt-2">
          Error submitting data. Please try again.
        </p>
      )}
    </div>
  );
};

export default SubmitDataButton;
