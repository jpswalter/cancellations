import { getCustomerFieldDisplayName } from '@/utils/template.utils';
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
      header: getCustomerFieldDisplayName(field),
      accessorKey: `customerInfo.${field}`,
      cell: ({ getValue }: { getValue: () => string }) => getValue() || '-',
      meta: {
        isCustomerInfo: true,
      },
    }));
};
