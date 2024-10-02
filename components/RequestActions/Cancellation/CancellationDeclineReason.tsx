import { Request, DeclineReason } from '@/lib/db/schema';
import { getCustomerFieldDisplayName } from '@/utils/template.utils';
import { getTenants } from '@/lib/api/tenant';
import { useQuery } from '@tanstack/react-query';

type Props = {
  request: Request;
  setDeclineReasons: (value: DeclineReason[]) => void;
  selectedDeclineReasons: DeclineReason[];
};

const CancellationDeclineReason: React.FC<Props> = ({
  request,
  setDeclineReasons,
  selectedDeclineReasons,
}) => {
  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
  });

  const provider = tenants?.find(
    tenant => tenant.id === request.providerTenantId,
  );

  if (!provider) {
    return <p>No provider found</p>;
  }

  const options =
    provider?.requiredCustomerInfo?.map(field => ({
      field,
      label: 'Wrong ' + getCustomerFieldDisplayName(field),
      value: request.customerInfo[field] || '',
    })) ?? [];

  const handleChange = (option: (typeof options)[0]) => {
    const isAlreadySelected = selectedDeclineReasons.some(
      reason => reason.field === option.field,
    );

    const newDeclineReasons = isAlreadySelected
      ? selectedDeclineReasons.filter(reason => reason.field !== option.field)
      : [...selectedDeclineReasons, option];

    const reasonsWithNoLabels: DeclineReason[] = newDeclineReasons.map(
      reason => ({
        field: reason.field,
        value: reason.value,
      }),
    );

    setDeclineReasons(reasonsWithNoLabels);
  };

  return (
    <div onClick={e => e.stopPropagation()} className="text-base">
      {options.map(option => (
        <div
          key={option.field}
          className="p-2 hover:bg-gray-100 cursor-pointer"
        >
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedDeclineReasons.some(
                reason => reason.field === option.field,
              )}
              onChange={() => handleChange(option)}
              className="mr-2"
            />
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CancellationDeclineReason;
