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
import {
  RequestStatus as RequestStatusType,
  TenantType,
  RequestType,
} from '@/lib/db/schema';
import RequestStatus from '../RequestStatus/RequestStatus';
import clsx from 'clsx';

interface FiltersProps {
  dateRange: DateRangePickerValue;
  setDateRange: (value: DateRangePickerValue) => void;
  selectedRequestStatus: RequestStatusType | undefined;
  setSelectedRequestStatus: (status: RequestStatusType | undefined) => void;
  selectedRequestType: RequestType | undefined;
  setSelectedRequestType: (type: RequestType | undefined) => void;
  searchId: string;
  setSearchId: (id: string) => void;
  showStatusFilter: boolean;
  showSearchId: boolean;
  tenantType: TenantType | undefined;
  selectedTenant: string | undefined;
  setSelectedTenant: (tenantId: string | undefined) => void;
  doNotWrap?: boolean;
}

const Filters: React.FC<FiltersProps> = ({
  dateRange,
  setDateRange,
  selectedRequestStatus,
  setSelectedRequestStatus,
  selectedRequestType,
  setSelectedRequestType,
  searchId,
  setSearchId,
  showStatusFilter,
  showSearchId,
  tenantType,
  selectedTenant,
  setSelectedTenant,
  doNotWrap,
}) => {
  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => getTenants(),
  });
  const proxyTenants = tenants?.filter(tenant => tenant.type === 'proxy') || [];
  const providerTenants =
    tenants?.filter(tenant => tenant.type === 'provider') || [];

  const requestStatuses: RequestStatusType[] = [
    'Pending',
    'Canceled',
    'Declined',
    'Save Offered',
    'Save Declined',
    'Save Accepted',
    'Save Confirmed',
    'Applied',
    'Not Qualified',
  ];

  const isProxy = tenantType === 'proxy';
  const filterLabel = isProxy ? 'Destination' : 'Source';
  const relevantTenants = isProxy ? providerTenants : proxyTenants;

  const requestTypes: RequestType[] = ['Cancellation', 'Discount'];

  return (
    <div
      className={clsx('z-50 flex gap-4 flex-1', doNotWrap ? '' : 'flex-wrap')}
    >
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
          value={selectedRequestStatus}
          placeholder="Status"
          onValueChange={value =>
            setSelectedRequestStatus(value as RequestStatusType)
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
      <Select
        className="w-52"
        value={selectedTenant}
        placeholder={filterLabel}
        onValueChange={value => setSelectedTenant(value || undefined)}
        enableClear={true}
      >
        {relevantTenants.map(tenant => (
          <SelectItem key={tenant.id} value={tenant.id}>
            {tenant.name}
          </SelectItem>
        ))}
      </Select>
      <Select
        className="w-52"
        value={selectedRequestType}
        placeholder="Request Type"
        onValueChange={value => setSelectedRequestType(value as RequestType)}
        enableClear={true}
      >
        {requestTypes.map(type => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </Select>
      {showSearchId && (
        <TextInput
          className="w-fit"
          placeholder="Search by ID"
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
        />
      )}
    </div>
  );
};

export default Filters;
