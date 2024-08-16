import { Request } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Row } from '@tanstack/react-table';

const CTACell: React.FC<{
  row: Row<Request>;
  toggleDrawer: (request: Request) => void;
}> = ({ row, toggleDrawer }) => {
  const { userData } = useAuth();
  const isProviderUser = userData?.tenantType === 'provider';
  const isProxyUser = userData?.tenantType === 'proxy';
  const requestStatus = row.original.status;

  const handleClick = () => {
    toggleDrawer(row.original);
  };

  if (isProviderUser && requestStatus === 'Save Accepted') {
    return (
      <div onClick={e => e.stopPropagation()}>
        <Button color="blue" onClick={handleClick}>
          Confirm
        </Button>
      </div>
    );
  }

  if (isProxyUser) {
    if (requestStatus === 'Declined') {
      return (
        <div onClick={e => e.stopPropagation()}>
          <Button onClick={handleClick} color="blue">
            Fix Data
          </Button>
        </div>
      );
    }

    if (requestStatus === 'Save Offered') {
      return (
        <div onClick={e => e.stopPropagation()}>
          <Button onClick={handleClick} color="blue">
            View Offer
          </Button>
        </div>
      );
    }
  }

  return null;
};

export default CTACell;
