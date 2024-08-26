import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RequestStatus, TenantType } from '@/lib/db/schema';
import { getRequests } from '@/lib/api/request';
import { DateRangePickerValue } from '@tremor/react';

interface UseRequestsProps {
  tenantType: TenantType | undefined;
  tenantId: string | undefined;
  initialStatusFilters?: RequestStatus[];
}

export const useRequests = ({
  tenantType,
  tenantId,
  initialStatusFilters,
}: UseRequestsProps) => {
  const [dateRange, setDateRange] = useState<DateRangePickerValue>({
    from: undefined,
    to: undefined,
  });
  const [selectedSource, setSelectedSource] = useState<string | undefined>(
    undefined,
  );
  const [selectedRequestType, setSelectedRequestType] = useState<
    RequestStatus | undefined
  >(undefined);
  const [statusFilters, setStatusFilters] = useState<RequestStatus[]>(
    initialStatusFilters || [],
  );
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

      const sourceMatch = selectedSource
        ? request.proxyTenantId === selectedSource
        : true;

      const requestTypeMatch = selectedRequestType
        ? request.status === selectedRequestType
        : true;

      const statusMatch =
        statusFilters.length > 0
          ? statusFilters.includes(request.status)
          : true;

      const idMatch = searchId
        ? request.id.toLowerCase().includes(searchId.toLowerCase())
        : true;

      return (
        dateInRange && sourceMatch && requestTypeMatch && statusMatch && idMatch
      );
    });
  }, [
    requests,
    dateRange,
    selectedSource,
    selectedRequestType,
    statusFilters,
    searchId,
  ]);

  return {
    requests: filteredRequests,
    isLoading,
    error,
    filters: {
      dateRange,
      setDateRange,
      selectedSource,
      setSelectedSource,
      selectedRequestType,
      setSelectedRequestType,
      statusFilters,
      setStatusFilters,
      searchId,
      setSearchId,
    },
  };
};
