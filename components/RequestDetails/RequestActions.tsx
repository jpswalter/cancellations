import { CustomerInfoField, Request } from '@/lib/db/schema';
import FixCustomerInfo from './FixCustomerInfo';
import SaveOfferWidget from './SaveOfferWidget';
import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const RequestActions: React.FC<{
  request: Request;
  onFix?: () => void;
}> = ({ request, onFix }) => {
  const { userData } = useAuth();
  const { tenantType } = userData || {};

  const isActionNeeded: boolean = useMemo(() => {
    if (!request) return false;

    const { declineReason, status } = request;

    return (
      (tenantType === 'proxy' &&
        (declineReason !== null ||
          status === 'Save Offered' ||
          status === 'Save Confirmed')) ||
      (tenantType === 'provider' &&
        (status === 'Save Accepted' || status === 'Save Declined'))
    );
  }, [request, tenantType]);

  const [isWidgetVisible, setIsWidgetVisible] = useState(false);

  useEffect(() => {
    if (isActionNeeded) {
      setIsWidgetVisible(true);
    } else {
      setIsWidgetVisible(false);
    }
  }, [isActionNeeded]);

  if (!isWidgetVisible) {
    return null;
  }

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
