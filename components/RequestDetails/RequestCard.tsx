import { Request } from '@/lib/db/schema';
import { getDisplayHeader } from '@/utils/template.utils';
import RequestStatus from '../RequestStatus/RequestStatus';
import useFirebase from '@/hooks/useFirebase';
import Spinner from '../ui/spinner';
import { TenantCell } from '../RequestsTable/cells/Cell';
import { FC } from 'react';

const RequestDetails: React.FC<{ request: Request | null }> = ({ request }) => {
  const { data: tenants, loading: tenantsLoading } = useFirebase({
    collectionName: 'tenants',
  });

  const findTenantName = (tenantId: string) => {
    return tenants?.find(tenant => tenant.id === tenantId)?.name;
  };

  if (!request) return null;

  const {
    id,
    status,
    submittedBy,
    requestType,
    proxyTenantId,
    providerTenantId,
    customerInfo,
    successfullyResolved,
    saveOffer,
    declineReason,
    notes,
  } = request;

  const hasAdditonalDetails = saveOffer || declineReason || notes;

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div className="bg-white p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">Request Information</h2>
            <RequestStatus status={status} />
          </div>
          <InfoItem
            label="Request Type"
            value={<RequestType type={requestType as 'Cancellation'} />}
          />
          {successfullyResolved !== null && (
            <InfoItem
              label="Successfully Resolved"
              value={successfullyResolved ? 'Yes' : 'No'}
            />
          )}
          <InfoItem
            label="Source"
            value={
              <TenantCell
                name={findTenantName(proxyTenantId)}
                isLoading={tenantsLoading}
              />
            }
            isLoading={tenantsLoading}
          />
          <InfoItem label="Submitted By" value={submittedBy} />
          <InfoItem
            label="Destination"
            value={
              <TenantCell
                name={findTenantName(providerTenantId)}
                isLoading={tenantsLoading}
              />
            }
            isLoading={tenantsLoading}
          />

          <InfoItem label="Request ID" value={id} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            {Object.entries(customerInfo)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([key, value]) => (
                <InfoItem
                  key={key}
                  label={getDisplayHeader(key)}
                  value={value}
                />
              ))}
          </div>

          {hasAdditonalDetails && (
            <div className="bg-white p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
              {saveOffer && (
                <InfoItem label="Save Offer" value={saveOffer.title} />
              )}
              {declineReason && (
                <InfoItem
                  label="Decline Reason"
                  value={declineReason.join(', ')}
                />
              )}
              {notes && <InfoItem label="Notes" value={notes} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{
  label: string;
  value: string | React.ReactNode;
  isLoading?: boolean;
}> = ({ label, value, isLoading }) => {
  const valueElement = typeof value === 'string' ? <span>{value}</span> : value;
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="font-medium">{label}: </span>
      {isLoading ? <Spinner className="p-2" /> : valueElement}
    </div>
  );
};

const RequestType: FC<{ type: 'Cancellation' }> = ({ type }) => {
  const colorMap = {
    Cancellation: 'bg-sky-100 text-sky-800',
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[type]}`}
    >
      {type}
    </span>
  );
};

export default RequestDetails;
