import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RequestStatus, TenantType, RequestType } from '@/lib/db/schema';
import { getRequests } from '@/lib/api/request';
import { DateRangePickerValue } from '@tremor/react';

interface UseRequestsProps {
  tenantType: TenantType | undefined;
  tenantId: string | undefined;
  initialStatusFilters?: RequestStatus[];
  showStatusFilter?: boolean;
  showSearchId?: boolean;
}

export const useRequests = ({
  tenantType,
  tenantId,
  initialStatusFilters,
  showStatusFilter = true,
  showSearchId = false,
}: UseRequestsProps) => {
  const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    from: undefined,
    to: undefined,
  });
  const [selectedTenant, setSelectedTenant] = useState<string | undefined>(
    undefined,
  );
  const [selectedRequestStatus, setSelectedRequestStatus] = useState<
    RequestStatus | undefined
  >(undefined);
  const [selectedRequestType, setSelectedRequestType] = useState<
    RequestType | undefined
  >(undefined);

  const [statusFilters, setStatusFilters] = useState<
    RequestStatus[] | undefined
  >(initialStatusFilters);

  useEffect(() => {
    if (initialStatusFilters && !statusFilters?.length) {
      setStatusFilters(initialStatusFilters);
    }
  }, [initialStatusFilters, statusFilters?.length]);

  const [searchId, setSearchId] = useState<string>('');

  const {
    data: requests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['requests', tenantType, tenantId],
    queryFn: () => getRequests(tenantType, tenantId),
    enabled: !!tenantType && !!tenantId,
  });

  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    return requests.filter(request => {
      const dateInRange =
        dateRange.from && dateRange.to
          ? new Date(request.dateSubmitted) >= dateRange.from &&
            new Date(request.dateSubmitted) <= dateRange.to
          : true;

      const tenantMatch = selectedTenant
        ? tenantType === 'proxy'
          ? request.providerTenantId === selectedTenant
          : request.proxyTenantId === selectedTenant
        : true;

      const requestStatusMatch = selectedRequestStatus
        ? request.status === selectedRequestStatus
        : true;

      const statusMatch =
        Number(statusFilters?.length) > 0
          ? statusFilters?.includes(request.status)
          : true;

      const idMatch = searchId
        ? request.id.toLowerCase().includes(searchId.toLowerCase())
        : true;

      const requestTypeMatch = selectedRequestType
        ? request.requestType === selectedRequestType
        : true;

      return (
        dateInRange &&
        tenantMatch &&
        requestStatusMatch &&
        statusMatch &&
        idMatch &&
        requestTypeMatch
      );
    });
  }, [
    requests,
    dateRange,
    selectedTenant,
    selectedRequestStatus,
    statusFilters,
    searchId,
    selectedRequestType,
    tenantType,
  ]);

  return {
    requests: filteredRequests,
    isLoading,
    error,
    filters: {
      dateRange,
      setDateRange,
      selectedTenant,
      setSelectedTenant,
      selectedRequestType,
      setSelectedRequestType,
      selectedRequestStatus,
      setSelectedRequestStatus,
      statusFilters,
      setStatusFilters,
      searchId,
      setSearchId,
      tenantType,
      showStatusFilter,
      showSearchId,
    },
  };
};
