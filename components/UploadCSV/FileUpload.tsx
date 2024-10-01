import { FC, useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Upload } from 'lucide-react';
import { FileUploader } from 'react-drag-drop-files';
import { FaRegTrashAlt } from 'react-icons/fa';

import { useUpload } from './UploadCSVProvider/upload.hooks';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';

import UploadErrors from './UploadErrors';
import { SelectItem, Select as SelectTremor } from '@tremor/react';
import useFirebase from '@/hooks/useFirebase';
import { generateHeaders } from '@/utils/template.utils';
import { RequestType } from '@/lib/db/schema';
import { parseErrorMessage } from '@/utils/general';

const FileUpload: FC = () => {
  const {
    csv,
    filename,
    setCsvResponse,
    resetCsvFile,
    setUploadedFilename,
    setCsvFormData,
    setSelectedProvider,
    selectedProviderId,
  } = useUpload();
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [selectedRequestType, setSelectedRequestType] =
    useState<RequestType>('Cancellation');

  const hasValidationError = csv?.status === 'error';
  const csvValidationErrorMessage = hasValidationError ? csv?.error : undefined;

  const { data: tenants, loading: providersLoading } = useFirebase({
    collectionName: 'tenants',
    filterBy: 'type',
    filterValue: 'provider',
  });

  const deleteFile = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setUploadError(undefined);
    resetCsvFile();
  };

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: setCsvResponse,
    onError: error => {
      console.log('uploadMutation error', error);
      const msg = parseErrorMessage(error);
      setUploadError(msg);
    },
  });

  const handleUpload = async (file: File) => {
    if (filename) {
      setUploadError(undefined);
      resetCsvFile();
    }
    setUploadedFilename(file.name);
    const formData = new FormData();
    formData.append('file', file);
    if (selectedProviderId) {
      formData.append('providerId', selectedProviderId);
    }
    formData.append('requestType', selectedRequestType);
    setCsvFormData(formData);
    await uploadMutation.mutateAsync(formData);
  };

  console.log('uploadMutation erprr');

  const handleSelectProvider = (value: string) => {
    setSelectedProvider(value);
  };

  const handleSelectRequestType = (value: string) => {
    setSelectedRequestType(value as RequestType);
  };

  const generateCSVTemplate = useCallback(() => {
    if (!selectedProviderId || !tenants) return '';

    const selectedProvider = tenants.find(p => p.id === selectedProviderId);
    if (!selectedProvider || !selectedProvider.requiredCustomerInfo) return '';

    return generateHeaders(selectedProvider.requiredCustomerInfo);
  }, [selectedProviderId, tenants]);

  const handleDownloadTemplate = useCallback(() => {
    const csvContent = generateCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const providerName = tenants?.find(p => p.id === selectedProviderId)?.name;
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${providerName} template.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [generateCSVTemplate, selectedProviderId, tenants]);

  return (
    <div className="w-full flex flex-col gap-8 mt-4">
      <div className="w-full flex flex-col gap-2">
        <h3>1. Select a provider</h3>
        <div className="flex gap-2">
          <SelectTremor
            enableClear={false}
            className="z-30 w-52"
            defaultValue="1"
            disabled={providersLoading}
            placeholder="Select a provider"
            onValueChange={handleSelectProvider}
          >
            {tenants?.map(tenant => (
              <SelectItem value={tenant.id} key={tenant.id}>
                {tenant.name}
              </SelectItem>
            ))}
          </SelectTremor>
          <Button
            onClick={handleDownloadTemplate}
            disabled={!selectedProviderId}
            outline={true}
          >
            Download template
          </Button>
        </div>
        <Text className="text-sm text-gray-600 max-w-prose">
          Each provider requires different customer information for requests,
          like an email, address, account number, or the last four digits of a
          credit card. Please select a provider from the list, download the
          template and fill in the required information.
        </Text>
      </div>
      <div className="w-full flex flex-col gap-2">
        <h3>2. Select request type</h3>
        <div className="flex gap-2">
          <SelectTremor
            enableClear={false}
            className="z-20 w-52"
            placeholder="Select request type"
            onValueChange={handleSelectRequestType}
            value={selectedRequestType}
          >
            <SelectItem value="Cancellation">Cancellation</SelectItem>
            <SelectItem value="Discount">Discount</SelectItem>
          </SelectTremor>
        </div>
      </div>
      <div className="w-full flex flex-col gap-2">
        <h3>3. Make sure your CSV file follows the required format</h3>
        <Text className="text-sm text-gray-600">
          For any issues or support, please contact our customer service team at{' '}
          <a href="mailto:admin@proxylink.co" className="underline">
            admin@proxylink.co
          </a>
          .
        </Text>
        <FileUploader
          handleChange={handleUpload}
          name="file"
          types={['CSV']}
          disabled={uploadMutation.isPending || !selectedProviderId}
        >
          <div className="flex flex-col gap-4 items-center p-16 border-dashed border-2 border-gray-300 rounded-lg">
            <Text>Drag and drop your file here or click to upload.</Text>
            {csv && filename ? (
              <div className="flex items-center justify-between p-2 border rounded gap-4">
                <Text>{filename}</Text>
                <Button onClick={deleteFile} outline={true}>
                  <FaRegTrashAlt />
                </Button>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center">
                <Button
                  disabled={uploadMutation.isPending || !selectedProviderId}
                  className="justify-center"
                >
                  {uploadMutation.isPending ? (
                    <Spinner className="mr-2" />
                  ) : (
                    <Upload className="mr-2" />
                  )}
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
                </Button>
              </div>
            )}
          </div>
        </FileUploader>
      </div>
      <UploadErrors message={uploadError ?? csvValidationErrorMessage} />
    </div>
  );
};

export default FileUpload;
