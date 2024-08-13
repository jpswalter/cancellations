import { CustomerInfoField, Request } from '@/lib/db/schema';
import FixCustomerInfo from './FixCustomerInfo';
import SaveOfferWidget from './SaveOfferWidget';

const RequestActions: React.FC<{
  request: Request;
  onFix: () => void;
}> = ({ request, onFix }) => {
  if (request?.declineReason) {
    const declineReasonMap: Record<string, CustomerInfoField> = {
      'Wrong Customer Name': 'customerName',
      'Wrong Customer Email': 'customerEmail',
      'Wrong Account Number': 'accountNumber',
      'Wrong Last 4 CC Digits': 'lastFourCCDigits',
    };
    return (
      <FixCustomerInfo
        request={request}
        field={declineReasonMap[request?.declineReason]}
        onFix={onFix}
      />
    );
  }

  if (request.saveOffer) {
    return <SaveOfferWidget request={request} onFix={onFix} />;
  }

  return null;
};

export default RequestActions;
