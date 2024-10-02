import { RequestType } from '@/lib/db/schema';
import { Badge } from '@/components/ui/badge';
import { FC } from 'react';

const RequestTypeComponent: FC<{ type: RequestType }> = ({ type }) => {
  return (
    <Badge color={type === 'Cancellation' ? 'red' : 'amber'}>{type}</Badge>
  );
};

export default RequestTypeComponent;
