import { useState, useRef, useEffect } from 'react';

type CustomDropdownProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export const Dropdown: React.FC<CustomDropdownProps> = ({
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
