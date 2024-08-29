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
} from '@/lib/db/schema';
import RequestStatus from '../RequestStatus/RequestStatus';

interface FiltersProps {
  dateRange: DateRangePickerValue;
  setDateRange: (value: DateRangePickerValue) => void;
  selectedRequestType: RequestStatusType | undefined;
  setSelectedRequestType: (status: RequestStatusType | undefined) => void;
  searchId: string;
  setSearchId: (id: string) => void;
  showStatusFilter: boolean;
  showSearchId: boolean;
  tenantType: TenantType | undefined;
  selectedTenant: string | undefined;
  setSelectedTenant: (tenantId: string | undefined) => void;
}

const Filters: React.FC<FiltersProps> = ({
  dateRange,
  setDateRange,
  selectedRequestType,
  setSelectedRequestType,
  searchId,
  setSearchId,
  showStatusFilter,
  showSearchId,
  tenantType,
  selectedTenant,
  setSelectedTenant,
}) => {
  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
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
  ];

  const isProxy = tenantType === 'proxy';
  const filterLabel = isProxy ? 'Destination' : 'Source';
  const relevantTenants = isProxy ? providerTenants : proxyTenants;

  return (
    <div className="z-50 flex space-x-4 flex-1 justify-end">
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
