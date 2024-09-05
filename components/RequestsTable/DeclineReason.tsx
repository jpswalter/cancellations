import { useFormContext, Controller } from 'react-hook-form';
import { Request, DeclineReason } from '@/lib/db/schema';
import { getDisplayHeader } from '@/utils/template.utils';
import { getTenants } from '@/lib/api/tenant';
import { useQuery } from '@tanstack/react-query';
import { Listbox, ListboxOptions, ListboxOption } from '@headlessui/react';

type Props = {
  request: Request;
  onChange: (value: DeclineReason[]) => void;
};

const DeclineReasonComponent: React.FC<Props> = ({ request, onChange }) => {
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
    provider?.requiredCustomerInfo?.map(field => ({
      field,
      value: 'Wrong ' + getDisplayHeader(field),
    })) ?? [];

  const handleChange = (value: DeclineReason[]) => {
    clearErrors('declineReason');
    setValue('declineReason', value);
    onChange(value);
  };

  return (
    <div onClick={e => e.stopPropagation()} className="text-base">
      <Controller
        name="declineReason"
        control={control}
        render={({ field }) => (
          <Listbox
            value={field.value}
            onChange={handleChange}
            disabled={shouldDisable}
            multiple
          >
            <ListboxOptions
              static
              className="border border-gray-300 rounded-md p-2 bg-white"
            >
              {options.map(option => (
                <ListboxOption
                  key={option.field}
                  value={option}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {({ selected }) => (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selected}
                        readOnly
                        className="mr-2"
                      />
                      {option.value}
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>
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

export default DeclineReasonComponent;
