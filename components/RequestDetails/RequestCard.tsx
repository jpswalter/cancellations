import { Request } from '@/lib/db/schema';
import { formatDate } from '@/utils/general';
import { getDisplayHeader } from '@/utils/template.utils';
import RequestStatus from '../RequestStatus/RequestStatus';
import useFirebase from '@/hooks/useFirebase';
import Spinner from '../ui/spinner';

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
    dateSubmitted,
    dateResponded,
    proxyTenantId,
    providerTenantId,
    customerInfo,
    successfullyResolved,
    saveOffer,
    declineReason,
    notes,
    logId,
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
          <InfoItem label="Request Type" value={requestType} />
          {successfullyResolved !== null && (
            <InfoItem
              label="Successfully Resolved"
              value={successfullyResolved.toString()}
            />
          )}
          <InfoItem
            label="Source"
            value={findTenantName(proxyTenantId)}
            isLoading={tenantsLoading}
          />
          <InfoItem
            label="Destination"
            value={findTenantName(providerTenantId)}
            isLoading={tenantsLoading}
          />
          <InfoItem label="Submitted By" value={submittedBy} />
          <InfoItem label="Date Submitted" value={formatDate(dateSubmitted)} />
          {dateResponded && (
            <InfoItem
              label="Date Responded"
              value={formatDate(dateResponded)}
            />
          )}
          <InfoItem label="ID" value={id} />
          <InfoItem label="LogId" value={logId} />
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
                <InfoItem label="Decline Reason" value={declineReason} />
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
  value: string | undefined;
  isLoading?: boolean;
}> = ({ label, value, isLoading }) => (
  <div className="mb-2">
    <span className="font-medium">{label}: </span>
    <span>{isLoading ? <Spinner className="p-2" /> : value}</span>
  </div>
);

export default RequestDetails;
