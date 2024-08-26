import React from 'react';
import {
  DateRangePicker,
  DateRangePickerValue,
  Select,
  SelectItem,
} from '@tremor/react';
import { useQuery } from '@tanstack/react-query';
import { getTenants } from '@/lib/api/tenant';
import { RequestStatus as RequestStatusType } from '@/lib/db/schema';
import RequestStatus from '../RequestStatus/RequestStatus';

interface FiltersProps {
  dateRange: DateRangePickerValue;
  setDateRange: (value: DateRangePickerValue) => void;
  selectedSource: string | undefined;
  setSelectedSource: (sourceId: string | undefined) => void;
  selectedRequestType: RequestStatusType | undefined;
  setSelectedRequestType: (status: RequestStatusType | undefined) => void;
  showSourceFilter?: boolean;
  showRequestTypeFilter?: boolean;
}

const Filters: React.FC<FiltersProps> = ({
  dateRange,
  setDateRange,
  selectedSource,
  setSelectedSource,
  selectedRequestType,
  setSelectedRequestType,
  showSourceFilter = true,
  showRequestTypeFilter = true,
}) => {
  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
  });

  const proxyTenants = tenants?.filter(tenant => tenant.type === 'proxy') || [];

  const requestStatuses: RequestStatusType[] = [
    'Pending',
    'Canceled',
    'Declined',
    'Save Offered',
    'Save Declined',
    'Save Accepted',
    'Save Confirmed',
  ];

  return (
    <div className="flex space-x-4">
      {showRequestTypeFilter && (
        <Select
          className="w-52"
          value={selectedRequestType}
          placeholder="All Statuses"
          onValueChange={value =>
            setSelectedRequestType(value as RequestStatusType | undefined)
          }
          enableClear={true}
        >
          {requestStatuses.map(status => (
            <SelectItem key={status} value={status}>
              <RequestStatus status={status} />
            </SelectItem>
          ))}
        </Select>
      )}
      <DateRangePicker
        className="w-30"
        value={dateRange}
        onValueChange={setDateRange}
        enableClear={true}
        placeholder="Select date range"
      />
      {showSourceFilter && (
        <Select
          className="w-52"
          value={selectedSource}
          placeholder="All Sources"
          onValueChange={value => setSelectedSource(value || undefined)}
          enableClear={true}
        >
          {proxyTenants.map(tenant => (
            <SelectItem key={tenant.id} value={tenant.id}>
              {tenant.name}
            </SelectItem>
          ))}
        </Select>
      )}
    </div>
  );
};

export default Filters;
