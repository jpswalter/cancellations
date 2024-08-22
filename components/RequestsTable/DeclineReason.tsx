import { useFormContext, Controller } from 'react-hook-form';
import { Request } from '@/lib/db/schema';
import { getDisplayHeader } from '@/utils/template.utils';
import { Dropdown } from '@/components/ui/dropdown';
import { getTenants } from '@/lib/api/tenant';
import { useQuery } from '@tanstack/react-query';

type Props = {
  request: Request;
};

const DeclineReason: React.FC<Props> = ({ request }) => {
  const {
    control,
    formState: { errors },
    clearErrors,
    setValue,
  } = useFormContext();
  const shouldDisable =
    request.status === 'Save Confirmed' ||
    request.status === 'Declined' ||
    request.status === 'Canceled';

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
    provider?.requiredCustomerInfo?.map(
      field => 'Wrong ' + getDisplayHeader(field),
    ) ?? [];

  const handleChange = (value: string) => {
    clearErrors('declineReason');
    setValue('declineReason', value);
  };

  return (
    <div onClick={e => e.stopPropagation()} className="text-base ">
      <Controller
        name="declineReason"
        control={control}
        render={({ field }) => (
          <Dropdown
            options={options}
            value={field.value}
            onChange={handleChange}
            disabled={shouldDisable}
            placeholder="Select a reason"
          />
        )}
      />
      {errors.declineReason && (
        <p className="text-red-500 text-sm mt-1">
          {errors.declineReason.message as string}
        </p>
      )}
    </div>
  );
};

export default DeclineReason;
