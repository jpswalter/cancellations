import React, { useState, useRef, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CellProps } from './Cell';
import { Request, Tenant } from '@/lib/db/schema';
import { getDisplayHeader } from '@/utils/template.utils';

type CustomDropdownProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  disabled,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openUpwards, setOpenUpwards] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const tableBottom =
        document.querySelector('.table-container')?.getBoundingClientRect()
          .bottom ?? window.innerHeight;
      setOpenUpwards(rect.bottom + 200 > tableBottom); // 200px is an estimated dropdown height
    }
  }, [isOpen]);

  return (
    <div className="relative w-60" ref={dropdownRef}>
      <button
        className={`w-full p-2 text-left bg-white border rounded-lg ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {value || placeholder}
      </button>
      {isOpen && (
        <ul
          className={`divide-y divide-gray-200 absolute w-full bg-white border rounded-lg shadow-lg z-50 ${
            openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {options.map(option => (
            <li
              key={option}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

type DeclineReasonCellProps = CellProps<Request, string> & {
  provider?: Tenant;
};

const DeclineReasonCell: React.FC<DeclineReasonCellProps> = ({
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
  const options =
    provider?.requiredCustomerInfo?.map(
      field => 'Wrong ' + getDisplayHeader(field),
    ) ?? [];

  const handleChange = (value: string) => {
    clearErrors('declineReason');
    setValue('declineReason', value);
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      <Controller
        name="declineReason"
        control={control}
        defaultValue={declineReason ?? ''}
        render={({ field }) => (
          <CustomDropdown
            options={options}
            value={field.value}
            onChange={handleChange}
            disabled={hasSaveOfferApplied}
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

export default DeclineReasonCell;
