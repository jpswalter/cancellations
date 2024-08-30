import clsx from 'clsx';
import React, { FC } from 'react';

interface Props {
  color?: string;
  className?: string;
}

const Spinner: FC<Props> = ({
  className = 'h-6 w-6 border-gray-500',
}: Props) => (
  <div
    className={clsx(
      `inline-block animate-spin rounded-full border-4 border-solid border-r-transparent align-[-0.125em]`,
      className,
    )}
    role="status"
  >
    <span className="sr-only">Loading...</span>
  </div>
);

export const Loader: FC<Props> = ({
  className = 'w-24 h-24 border-blue-500',
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner className={className} />
    </div>
  );
};

export default Spinner;
