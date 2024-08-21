import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { IoIosPaper } from 'react-icons/io';
import ResolveModal from './ResolveModal';
import { Request } from '@/lib/db/schema';

interface ReportButtonProps {
  request: Request;
}

const ReportButton: React.FC<ReportButtonProps> = ({ request }) => {
  const [resolveModal, setResolveModal] = useState(false);
  const {
    trigger,
    watch,
    formState: { errors },
  } = useFormContext();

  const dirtyForm = Object.keys(errors).length > 0;
  const isResolved =
    request.status === 'Canceled' || request.status === 'Save Confirmed';
  const handleClick = async () => {
    const successfullyResolved = watch('successfullyResolved');
    if (successfullyResolved === null || successfullyResolved === undefined) {
      await trigger('successfullyResolved');
    } else {
      setResolveModal(true);
    }
  };

  return (
    <>
      <div>
        <Button
          outline={true}
          className="flex items-center whitespace-nowrap"
          onClick={handleClick}
          disabled={dirtyForm || isResolved}
        >
          <IoIosPaper />
          Report
        </Button>
      </div>
      <ResolveModal
        shown={resolveModal}
        request={request}
        closeModal={() => setResolveModal(false)}
      />
    </>
  );
};

export default ReportButton;
