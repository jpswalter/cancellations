import { getDisplayHeader } from '@/utils/template.utils';
import { SelectItem } from '@tremor/react';
import { FC } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CellProps } from './Cell';
import { Select as SelectTremor } from '@tremor/react';
import { Request, Tenant } from '@/lib/db/schema';

type DeclineReasonCellProps = CellProps<Request, string> & {
  provider?: Tenant;
};
const DeclineReasonCell: FC<DeclineReasonCellProps> = ({
  cell,
  provider,
  row,
}) => {
  const {
    control,
    formState: { errors },
    clearErrors,
    setValue,
  } = useFormContext();
  const hasSaveOfferApplied = row?.original.status === 'Save Confirmed';
  const declineReason = cell.getValue();
  const options = provider?.requiredCustomerInfo?.map(
    field => 'Wrong ' + getDisplayHeader(field),
  );

  const handleChange = (value: string) => {
    clearErrors('declineReason');
    setValue('declineReason', value);
  };

  if (!options) return null;

  const className = hasSaveOfferApplied
    ? 'w-60 pointer-events-none opacity-50'
    : 'w-60';

  return (
    <div onClick={e => e.stopPropagation()}>
      <Controller
        name="declineReason"
        control={control}
        defaultValue={declineReason ?? ''}
        render={({ field }) => (
          <SelectTremor
            enableClear={false}
            placeholder="Select a reason"
            value={field.value}
            onValueChange={handleChange}
            className={className}
            disabled={hasSaveOfferApplied}
          >
            {options.map(option => (
              <SelectItem key={option} value={option} className="w-full">
                {option}
              </SelectItem>
            ))}
          </SelectTremor>
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

export default DeclineReasonCell;
