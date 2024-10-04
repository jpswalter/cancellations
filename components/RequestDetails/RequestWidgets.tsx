import { Request } from '@/lib/db/schema';
import FixCustomerInfo from './FixCustomerInfo';
import SaveOfferWidget from './SaveOfferWidget';
import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const RequestWidgets: React.FC<{
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
        ((declineReason && declineReason.length > 0) ||
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

  if (request?.declineReason && request.declineReason.length > 0) {
    return (
      <FixCustomerInfo
        request={request}
        declineReasons={request.declineReason}
        onFix={onFix}
      />
    );
  }

  if (request.saveOffer) {
    return <SaveOfferWidget request={request} onFix={onFix} />;
  }

  return null;
};

export default RequestWidgets;
