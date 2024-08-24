import { updateRequest } from '@/lib/api/request';
import { CustomerInfoField, RequestStatus, Request } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import Spinner from '../ui/spinner';
import { getDisplayHeader } from '@/utils/template.utils';

const FixCustomerInfo: React.FC<{
  request: Request;
  field: CustomerInfoField;
  onFix?: () => void;
}> = ({ request, field, onFix }) => {
  const currentInvalidValue = request.customerInfo[field];
  const [newValue, setNewValue] = useState(currentInvalidValue);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newValue: string | undefined) => {
      const updatedRequest = {
        ...request,
        customerInfo: {
          ...request.customerInfo,
          [field]: newValue,
        },
        status: 'Pending' as RequestStatus,
        declineReason: null,
        successfullyResolved: null,
      };
      return updateRequest(updatedRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', request.id] });
      onFix?.();
    },
    onError: error => {
      setUpdateError(error.message);
    },
  });

  const newValueInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newValueInputRef.current) {
      newValueInputRef.current.focus();
    }
  }, [newValueInputRef]);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 mr-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h2 className="text-2xl font-bold">
          Action Required: Fix Customer Info
        </h2>
      </div>
      <p className="text-lg mb-4">
        The customer information provided for this request is incorrect.
        <br />
        Please verify and update the following field:
      </p>
      <p className="font-semibold text-lg mb-2">{getDisplayHeader(field)}</p>
      <div className="py-4 bg-white text-gray-800 rounded p-4 mb-4 flex items-start gap-4">
        <div>
          <p className="font-medium">Current value</p>
          <p className="text-red-500 mt-4">
            {currentInvalidValue === '' ? 'empty' : currentInvalidValue}
          </p>
        </div>
        <div>
          <label>
            New value
            <input
              type="text"
              className="w-full px-2 border border-gray-300 rounded mt-2"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              ref={newValueInputRef}
            />
          </label>
        </div>
        <Button
          onClick={() => mutation.mutate(newValue)}
          disabled={newValue === currentInvalidValue}
          className="self-end h-10"
        >
          {mutation.isPending ? <Spinner color="white" /> : 'Submit Info'}
        </Button>
        {updateError && (
          <p className="text-red-500 text-sm mt-1">{updateError}</p>
        )}
      </div>
    </div>
  );
};

export default FixCustomerInfo;
