import { Request } from '@/lib/db/schema';
import { FC } from 'react';
import CancellationActions from './Cancellation/CancellationActions';
import DiscountActions from './Discount/DiscountActions';

const RequestActions: FC<{ request: Request }> = ({ request }) => {
  if (request.requestType === 'Cancellation') {
    return <CancellationActions request={request} />;
  }
  if (request.requestType === 'Discount') {
    return <DiscountActions request={request} />;
  }
  return null;
};

export default RequestActions;
