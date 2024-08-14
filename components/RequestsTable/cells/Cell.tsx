// file: components/RequestsTable/Cell.tsx
import { formatDate } from '@/utils/general';
import { User, Network } from 'lucide-react';
import { Radio, RadioGroup, RadioField } from '@/components/ui/radio';
import { Cell, Row } from '@tanstack/react-table';
import { Request, Tenant } from '@/lib/db/schema';
import { useFormContext, useController, Controller } from 'react-hook-form';
import { FC } from 'react';
import { Select as SelectTremor, SelectItem } from '@tremor/react';
import Spinner from '../../ui/spinner';
import { getDisplayHeader } from '@/utils/template.utils';

export type CellProps<R, T> = {
  cell: Cell<R, T>;
  row?: Row<R>;
};

const DateCell: FC<CellProps<Request, string>> = ({ cell }) => {
  const date = cell.getValue();
  return formatDate(date);
};

const UsernameCell: FC<CellProps<Request, string>> = ({ cell }) => {
  const username = cell.getValue();
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-8 h-8 bg-pink-400 rounded-full">
        <User size={16} className="text-white" />
      </div>
      <span>{username}</span>
    </div>
  );
};

const ResolveCell: React.FC<CellProps<Request, boolean | null>> = ({
  cell,
}) => {
  const {
    control,
    setValue,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useFormContext();
  const cellValue = cell.getValue();
  const { field } = useController({
    name: 'successfullyResolved',
    control,
    defaultValue: cellValue,
    rules: { required: 'Please select Yes or No' },
  });

  const handleChange = (value: string) => {
    clearErrors('successfullyResolved');
    const newValue = value === 'Yes' ? true : value === 'No' ? false : null;
    setValue('successfullyResolved', newValue);

    // If the answer is No, check if declineReason is empty and set an error if it is
    if (value === 'No') {
      const declineReason = getValues('declineReason');
      if (!declineReason || declineReason.trim() === '') {
        setError('declineReason', {
          type: 'required',
          message: 'Provide a decline reason',
        });
      }
    } else {
      // Clear the declineReason error if the answer is not No
      clearErrors('declineReason');
    }
  };

  const displayValue = field.value === null ? '' : field.value ? 'Yes' : 'No';

  return (
    <div onClick={e => e.stopPropagation()} className="text-center">
      <RadioGroup
        className={`flex gap-4 justify-center ${errors.successfullyResolved ? 'border border-red-500 p-2 rounded' : ''}`}
        value={displayValue}
        onChange={handleChange}
      >
        {['Yes', 'No'].map(value => (
          <RadioField key={value} className="flex items-center gap-2">
            <Radio value={value} color="blue" />
            <label className="text-sm">{value}</label>
          </RadioField>
        ))}
      </RadioGroup>
      {errors.successfullyResolved && (
        <p className="text-red-500 text-sm mt-1">
          {errors.successfullyResolved.message as string}
        </p>
      )}
    </div>
  );
};

const TenantCell: FC<{ name?: string; isLoading: boolean }> = ({
  name,
  isLoading,
}) => {
  if (isLoading) return <Spinner className="p-2" />;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center w-8 h-8 bg-blue-400 rounded-full">
        <Network size={16} className="text-white" />
      </div>
      <span>{name}</span>
    </div>
  );
};

const RequestTypeCell: FC<CellProps<Request, 'Cancellation'>> = ({ cell }) => {
  const status = cell.getValue();
  const colorMap = {
    Cancellation: 'bg-sky-100 text-sky-800',
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[status]}`}
    >
      {status}
    </span>
  );
};

type DeclineReasonCellProps = CellProps<Request, string> & {
  provider?: Tenant;
};
const DeclineReasonCell: FC<DeclineReasonCellProps> = ({ cell, provider }) => {
  const {
    control,
    formState: { errors },
    clearErrors,
    setValue,
  } = useFormContext();

  const declineReason = cell.getValue();
  const options = provider?.requiredCustomerInfo?.map(
    field => 'Wrong ' + getDisplayHeader(field),
  );

  const handleChange = (value: string) => {
    clearErrors('declineReason');
    setValue('declineReason', value);
  };

  if (!options) return null;

  return (
    <div onClick={e => e.stopPropagation()}>
      <Controller
        name="declineReason"
        control={control}
        defaultValue={declineReason ?? ''}
        render={({ field }) => (
          <SelectTremor
            enableClear={false}
            className="w-60"
            placeholder="Select a reason"
            value={field.value}
            onValueChange={handleChange}
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

export {
  DateCell,
  UsernameCell,
  ResolveCell,
  TenantCell,
  RequestTypeCell,
  DeclineReasonCell,
};
