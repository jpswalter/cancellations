import { RadioField, RadioGroup, Radio } from '@/components/ui/radio';
import { useFormContext, useController } from 'react-hook-form';
import { CellProps } from './Cell';
import { Request } from '@/lib/db/schema';

const ResolveCell: React.FC<CellProps<Request, boolean | null>> = ({
  cell,
  row,
}) => {
  const {
    control,
    setValue,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useFormContext();
  const hasSaveOfferApplied = row?.original.status === 'Save Confirmed';
  const cellValue = hasSaveOfferApplied ? true : cell.getValue();
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
        disabled={hasSaveOfferApplied}
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

export default ResolveCell;
