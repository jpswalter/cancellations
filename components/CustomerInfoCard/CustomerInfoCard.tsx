import { FC } from 'react';
import { CustomerInfo } from '@/lib/db/schema';
import { getCustomerFieldDisplayName } from '@/utils/template.utils';

interface CustomerInfoCardProps {
  customerInfo: CustomerInfo;
}

const CustomerInfoCard: FC<CustomerInfoCardProps> = ({ customerInfo }) => (
  <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
    <div className="space-y-3">
      {Object.entries(customerInfo).map(([key, value]) => (
        <p key={key}>
          <span className="font-medium">
            {getCustomerFieldDisplayName(key)}:
          </span>{' '}
          {value}
        </p>
      ))}
    </div>
  </div>
);

export default CustomerInfoCard;
