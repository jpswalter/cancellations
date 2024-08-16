import { getDisplayHeader } from '@/utils/template.utils';
import { UsernameCell } from './cells/Cell';
import { Request } from '@/lib/db/schema';

export const generateCustomerInfoColumns = (requests: Request[]) => {
  const customerInfoFields = requests.reduce((fields, request) => {
    Object.keys(request.customerInfo).forEach(field => fields.add(field));
    return fields;
  }, new Set<string>());

  return Array.from(customerInfoFields)
    .sort((a, b) => {
      if (a.toLowerCase().includes('name')) return -1;
      if (b.toLowerCase().includes('name')) return 1;
      return a.localeCompare(b);
    })
    .map(field => ({
      header: getDisplayHeader(field),
      accessorKey: `customerInfo.${field}`,
      cell: field.toLowerCase().includes('name')
        ? UsernameCell
        : ({ getValue }: { getValue: () => string }) => getValue() || '-',
      meta: {
        isCustomerInfo: true,
        isHighlightable: true,
      },
    }));
};
