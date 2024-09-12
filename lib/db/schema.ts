// file: lib/db/schema.ts
export type RequestStatus =
  | 'Pending'
  | 'Canceled'
  | 'Declined'
  | 'Save Offered'
  | 'Save Declined'
  | 'Save Accepted'
  | 'Save Confirmed';

export type CustomerInfoField =
  | 'customerName'
  | 'customerEmail'
  | 'accountNumber'
  | 'lastFourCCDigits';

export type CustomerInfo = { [K in CustomerInfoField]?: string };

export type DeclineReason = {
  field: string;
  value: string;
};

export interface Request {
  id: string;
  version: number;
  status: RequestStatus;
  submittedBy: string;
  requestType: string;
  dateSubmitted: string;
  dateResponded: string | null;
  proxyTenantId: string;
  providerTenantId: string;
  customerInfo: CustomerInfo;
  saveOffer: RequestSaveOffer | null;
  declineReason: DeclineReason[] | null;
  notes: string | null;
  logId: string;
}

export interface RequestLog {
  requestId: string;
  changes: RequestChange[];
}

export interface RequestWithLog extends Request {
  log: RequestLog;
}

export interface RequestChange {
  field: string;
  oldValue: string | number | boolean | null | DeclineReason[];
  newValue: string | number | boolean | null | DeclineReason[];
  changedBy: {
    email: string;
    tenantType: TenantType;
    tenantId: string;
  };
  updatedAt: string; // ISO 8601 date string
}

export type TenantType = 'proxy' | 'provider' | 'management';

export interface User {
  id: string;
  version: number;
  email: string;
  tenantId: string;
  tenantName: string;
  tenantType: TenantType;
  role: 'admin' | 'user';
  createdAt: string;
  name: string;
}

export type SaveOffer = {
  id: string;
  dateCreated: string;
  dateUpdated: string | null;
  title: string;
  description: string;
};

export type RequestSaveOffer = SaveOffer & {
  dateOffered: string | null;
  dateAccepted?: string | null;
  dateDeclined?: string | null;
  dateConfirmed?: string | null;
};

export interface Tenant {
  id: string;
  version: number;
  name: string;
  type: TenantType;
  createdAt: string;
  active: boolean;
  requiredCustomerInfo?: CustomerInfoField[]; // Only for provider tenants
  saveOffers?: SaveOffer[];
  admins: string[];
}

export const CURRENT_SCHEMA_VERSION = 2;

export const collections = {
  requests: 'requests',
  users: 'users',
  tenants: 'tenants',
};
