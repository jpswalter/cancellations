import { RadioField, RadioGroup, Radio } from '@/components/ui/radio';
import { useFormContext, useController } from 'react-hook-form';
import { CellProps } from './Cell';
import { Request } from '@/lib/db/schema';
import { FaCheckCircle } from 'react-icons/fa';
import { FaCircleXmark } from 'react-icons/fa6';

const ResolveCell: React.FC<
  CellProps<Request, boolean | null> & {
    isProviderUser: boolean;
  }
> = ({ cell, row, isProviderUser }) => {
  const {
    control,
    setValue,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const shouldDisableRadio =
    row?.original.status === 'Save Confirmed' ||
    row?.original.status === 'Save Accepted' ||
    row?.original.status === 'Canceled' ||
    row?.original.status === 'Declined';

  const cellValue = shouldDisableRadio ? true : cell.getValue();
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
  };

  const displayValue = field.value === null ? '' : field.value ? 'Yes' : 'No';

  if (isProviderUser) {
    return (
      <div className="text-center">
        <RadioGroup
          className={`flex gap-4 justify-center ${errors.successfullyResolved ? 'border border-red-500 p-2 rounded' : ''}`}
          value={displayValue}
          onChange={handleChange}
          disabled={shouldDisableRadio}
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
  }

  const value = cell.getValue();
  if (value === null) {
    return null; // Return null for empty cell
  }
  return (
    <div className="flex justify-center items-center w-full h-full">
      {value ? (
        <FaCheckCircle className="text-green-500 text-2xl" />
      ) : (
        <FaCircleXmark className="text-red-500 text-2xl" />
      )}
    </div>
  );
};

export default ResolveCell;
