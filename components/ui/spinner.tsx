import React, { FC } from 'react';

interface Props {
  color?: string;
  className?: string;
}

const Spinner: FC<Props> = ({ className = '' }: Props) => (
  <div
    className={`inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid text-gray-600 border-r-transparent align-[-0.125em] ${className}`}
    role="status"
  >
    <span className="sr-only">Loading...</span>
  </div>
);

export const Loader = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner className="w-24 h-24 text-blue-500" />
    </div>
  );
};

export default Spinner;
