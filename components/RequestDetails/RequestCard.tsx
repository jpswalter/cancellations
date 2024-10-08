import { RequestWithLog } from '@/lib/db/schema';
import { getCustomerFieldDisplayName } from '@/utils/template.utils';
import RequestStatus from '../RequestStatus/RequestStatus';
import useFirebase from '@/hooks/useFirebase';
import Spinner from '../ui/spinner';
import { TenantCell } from '../RequestsTable/cells/Cell';
import { FC } from 'react';
import RequestTypeComponent from '../RequestType/RequestType';
import { getDeclineReason } from '@/utils/template.utils';

const RequestDetails: FC<{
  request: RequestWithLog | null | undefined;
}> = ({ request }) => {
  const { data: tenants, loading: tenantsLoading } = useFirebase({
    collectionName: 'tenants',
  });

  const findTenantName = (tenantId: string | undefined) => {
    return tenantId
      ? tenants?.find(tenant => tenant.id === tenantId)?.name
      : '';
  };

  const proxyName = findTenantName(request?.proxyTenantId);
  const providerName = findTenantName(request?.providerTenantId);

  if (!request) return null;

  const {
    id,
    status,
    submittedBy,
    requestType,
    proxyTenantId,
    providerTenantId,
    customerInfo,
    saveOffer,
    declineReason,
    notes,
    log,
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
            value={<RequestTypeComponent type={requestType} />}
          />
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
                  label={getCustomerFieldDisplayName(key)}
                  value={value}
                  isDataPrivate
                />
              ))}
          </div>

          {(log?.avgResponseTime.provider.hours !== 0 ||
            log?.avgResponseTime.proxy.hours !== 0) && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h3 className="text-lg font-semibold mb-2">
                Average Response Time
              </h3>
              <div className="flex flex-col">
                {log?.avgResponseTime.provider.hours !== 0 && (
                  <InfoItem
                    label={providerName}
                    value={`${log?.avgResponseTime.provider.hours} hours`}
                  />
                )}
                {log?.avgResponseTime.proxy.hours !== 0 && (
                  <InfoItem
                    label={proxyName}
                    value={`${log?.avgResponseTime.proxy.hours} hours`}
                  />
                )}
              </div>
            </div>
          )}

          {hasAdditonalDetails && (
            <div className="bg-white p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
              {saveOffer && (
                <InfoItem label="Save Offer" value={saveOffer.title} />
              )}
              {declineReason && (
                <InfoItem
                  label="Decline Reason"
                  value={getDeclineReason(declineReason)}
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
  isDataPrivate?: boolean;
}> = ({ label, value, isLoading, isDataPrivate }) => {
  const valueElement = typeof value === 'string' ? <span>{value}</span> : value;
  return (
    <div className="mb-2 flex items-start gap-2" data-private={isDataPrivate}>
      <span className="font-medium whitespace-nowrap">{label}: </span>
      {isLoading ? <Spinner className="p-2" /> : valueElement}
    </div>
  );
};

export default RequestDetails;
