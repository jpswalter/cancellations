import React, { useState } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';

interface InfoTooltipProps {
  text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover className="relative">
      <PopoverButton
        className="inline-flex items-center justify-center w-5 h-5 text-sm text-blue-400 rounded-full border border-blue-400"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        ?
      </PopoverButton>

      {isOpen && (
        <PopoverPanel
          static
          className="absolute z-50 w-64 p-2 mt-2 text-sm bg-white rounded-md shadow-xl"
          anchor="left"
        >
          {text}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-white"></div>
        </PopoverPanel>
      )}
    </Popover>
  );
};
