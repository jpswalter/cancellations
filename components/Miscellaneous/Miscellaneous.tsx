import { FC } from 'react';
import { Request } from '@/lib/db/schema';
import CancellationMiscellaneous from './Cancellation/CancellationMiscellaneous';
import DiscountMiscellaneous from './Discount/DiscountMiscellaneous';

const Miscellaneous: FC<{ request: Request }> = ({ request }) => {
  if (request.requestType === 'Cancellation') {
    return <CancellationMiscellaneous request={request} />;
  }
  if (request.requestType === 'Discount') {
    return <DiscountMiscellaneous />;
  }
  return null;
};

export default Miscellaneous;
