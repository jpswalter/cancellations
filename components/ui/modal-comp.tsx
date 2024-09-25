import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogPanel, Button } from '@tremor/react';

interface ModalProps {
  shown: boolean;
  onClose?: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  shown,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <Dialog open={shown} onClose={onClose || (() => {})} static={true}>
      <DialogPanel className={`w-full ${sizeClasses[size]}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {onClose && (
            <Button
              size="xs"
              variant="light"
              icon={X}
              onClick={onClose}
              color="gray"
            />
          )}
        </div>
        <div className="mb-4 overflow-hidden">{children}</div>
        {footer && <div className="flex justify-end">{footer}</div>}
      </DialogPanel>
    </Dialog>
  );
};
