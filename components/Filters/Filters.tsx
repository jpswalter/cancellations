import React from 'react';
import {
  DateRangePicker,
  DateRangePickerValue,
  Select,
  SelectItem,
  TextInput,
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
  searchId: string;
  setSearchId: (id: string) => void;
  showSourceFilter?: boolean;
  showStatusFilter?: boolean;
  showSearchId?: boolean;
}

const Filters: React.FC<FiltersProps> = ({
  dateRange,
  setDateRange,
  selectedSource,
  setSelectedSource,
  selectedRequestType,
  setSelectedRequestType,
  searchId,
  setSearchId,
  showSourceFilter = true,
  showStatusFilter = true,
  showSearchId = false,
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
    <div className="z-50 flex space-x-4 flex-1">
      <DateRangePicker
        className="w-30"
        value={dateRange}
        onValueChange={setDateRange}
        enableClear={true}
        placeholder="Select date range"
      />
      {showStatusFilter && (
        <Select
          className="w-52"
          value={selectedRequestType}
          placeholder="Status"
          onValueChange={value =>
            setSelectedRequestType(value as RequestStatusType)
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
      {showSourceFilter && (
        <Select
          className="w-52"
          value={selectedSource}
          placeholder="Source"
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

      {showSearchId && (
        <TextInput
          className="w-52 flex-1"
          placeholder="Search by ID"
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
        />
      )}
    </div>
  );
};

export default Filters;
