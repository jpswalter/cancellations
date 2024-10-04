import { CustomerInfoField, DeclineReason } from '@/lib/db/schema';
import AUTH_FIELDS from '@/constants/authFields.json';

export const getCustomerAuthField = (
  name: string,
): CustomerInfoField | undefined => {
  return AUTH_FIELDS.find(authField => authField.display === name)?.field;
};

export const generateCSVHeaders = (headers: string[]) => {
  return headers.map(getCustomerFieldDisplayName).join(',');
};

export const getCustomerFieldDisplayName = (field: string): string =>
  AUTH_FIELDS.find(authField => authField.field === field)?.display || field;

export const getDeclineReason = (reasons: DeclineReason[]) => {
  return reasons
    .map(reason => {
      if (reason.field === 'notQualified') {
        return 'Customer is not qualified for the discount';
      }
      return 'Wrong ' + getCustomerFieldDisplayName(reason.field);
    })
    .join(', ');
};
