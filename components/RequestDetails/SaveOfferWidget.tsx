import { FC, useState } from 'react';
import { Request, RequestStatus } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import Spinner from '../ui/spinner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { updateRequest } from '@/lib/api/request';
import { parseErrorMessage } from '@/utils/general';

interface SaveOfferWidgetProps {
  request: Request;
  onFix?: () => void;
}

const SaveOfferWidget: FC<SaveOfferWidgetProps> = ({ request, onFix }) => {
  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const [updateError, setUpdateError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (newStatus: RequestStatus) => {
      if (!request.saveOffer) {
        throw new Error('Save offer data is missing.');
      }

      const isAccepted = newStatus === 'Save Confirmed';
      const isDeclined = newStatus === 'Save Declined';
      const isConfirmed = newStatus === 'Save Confirmed';

      const updatedSaveOffer = {
        ...request.saveOffer,
        dateAccepted: isAccepted
          ? new Date().toISOString()
          : request.saveOffer.dateAccepted,
        dateDeclined: isDeclined
          ? new Date().toISOString()
          : request.saveOffer.dateDeclined,
        dateConfirmed: isConfirmed
          ? new Date().toISOString()
          : request.saveOffer.dateConfirmed,
      };

      const updatedRequest = {
        ...request,
        status: newStatus,
        dateResponded: new Date().toISOString(),
        saveOffer: updatedSaveOffer,
      };

      return updateRequest(updatedRequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', request.id] });
      onFix?.();
    },
    onError: (error: unknown) => {
      setUpdateError(parseErrorMessage(error));
    },
  });

  const isProviderUser = userData?.tenantType === 'provider';
  const isProxyUser = userData?.tenantType === 'proxy';

  // Text map based on status
  const textMap: Record<string, { title: string; message: string }> = {
    'Save Offered': {
      title: 'Save Offer Proposal',
      message:
        'You have received a save offer. Please decide whether to accept or decline it.',
    },
    'Save Accepted': {
      title: 'Save Offer Confirmed',
      message: `A save offer has been accepted by ${request?.customerInfo?.customerEmail}. Please confirm the save.`,
    },
    'Save Declined': {
      title: 'Save Offer Declined',
      message: `The save offer has been declined by ${request?.customerInfo?.customerEmail}. Please proceed with the cancellation.`,
    },
    'Save Confirmed': {
      title: 'Confirm Save Offer',
      message: `A save offer has been confirmed by provider. Thank you for being a customer.`,
    },
  };

  const { title, message } = textMap[request.status];
  const shouldShowOfferDetails =
    request.status === 'Save Offered' || request.status === 'Save Confirmed';

  return (
    <div className="bg-gradient-to-r from-green-500 to-yellow-600 text-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-lg mb-4">{message}</p>
      {shouldShowOfferDetails && (
        <div className="mb-4 p-4 bg-white text-gray-800 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold mb-2">
            {request.saveOffer?.title}
          </h3>
          <p className="break-words whitespace-pre-wrap">
            {request.saveOffer?.description}
          </p>
        </div>
      )}
      {updateError && (
        <p className="text-red-500 text-sm mb-4">{updateError}</p>
      )}
      {isProxyUser && (
        <div className="flex gap-4 items-center">
          <Button
            onClick={() => mutation.mutate('Save Accepted')}
            disabled={mutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {mutation.isPending ? <Spinner color="white" /> : 'Accept Offer'}
          </Button>
          <Button
            onClick={() => mutation.mutate('Save Declined')}
            disabled={mutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {mutation.isPending ? <Spinner color="white" /> : 'Decline Offer'}
          </Button>
        </div>
      )}
      {isProviderUser && request.status !== 'Save Declined' && (
        <Button
          onClick={() => mutation.mutate('Save Confirmed')}
          disabled={mutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {mutation.isPending ? <Spinner color="white" /> : 'Confirm Save'}
        </Button>
      )}
    </div>
  );
};

export default SaveOfferWidget;
