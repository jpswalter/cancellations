import { Tenant, User } from '@/lib/db/schema';
import { CURRENT_SCHEMA_VERSION } from '../schema';
import { v4 as uuidv4 } from 'uuid';

const currentDate = new Date().toISOString();

export const TENANTS: Tenant[] = [
  {
    id: uuidv4(),
    name: 'Demo Proxy 1',
    type: 'proxy',
    createdAt: currentDate,
    active: true,
    version: CURRENT_SCHEMA_VERSION,
  },
  {
    id: uuidv4(),
    name: 'Demo Proxy 2',
    type: 'proxy',
    createdAt: currentDate,
    active: true,
    version: CURRENT_SCHEMA_VERSION,
  },
  {
    id: uuidv4(),
    name: 'Demo Provider',
    type: 'provider',
    createdAt: currentDate,
    active: true,
    version: CURRENT_SCHEMA_VERSION,
    requiredCustomerInfo: [
      'customerName',
      'customerEmail',
      'accountNumber',
      'lastFourCCDigits',
    ],
  },
  {
    id: uuidv4(),
    name: 'ProxyLink Management',
    type: 'management',
    createdAt: currentDate,
    active: true,
    version: CURRENT_SCHEMA_VERSION,
  },
];

export const USERS: User[] = [
  {
    id: uuidv4(),
    email: 'employee1@demoprovider.com',
    name: 'Zephyr Stormwind',
    tenantId: TENANTS[2].id,
    tenantName: TENANTS[2].name,
    tenantType: TENANTS[2].type,
    role: 'user',
    createdAt: currentDate,
    version: CURRENT_SCHEMA_VERSION,
  },
  {
    id: uuidv4(),
    email: 'admin@demoprovider.com',
    name: 'Admin Starlight',
    tenantId: TENANTS[2].id,
    tenantName: TENANTS[2].name,
    tenantType: TENANTS[2].type,
    role: 'admin',
    createdAt: currentDate,
    version: CURRENT_SCHEMA_VERSION,
  },
  {
    id: uuidv4(),
    email: 'employee1@demoproxy.com',
    name: 'Michael Scott',
    tenantId: TENANTS[0].id,
    tenantName: TENANTS[0].name,
    tenantType: TENANTS[0].type,
    role: 'user',
    createdAt: currentDate,
    version: CURRENT_SCHEMA_VERSION,
  },
  {
    id: uuidv4(),
    email: 'admin@demoproxy.com',
    name: 'Dwight Schrute',
    tenantId: TENANTS[0].id,
    tenantName: TENANTS[0].name,
    tenantType: TENANTS[0].type,
    role: 'admin',
    createdAt: currentDate,
    version: CURRENT_SCHEMA_VERSION,
  },
  {
    id: uuidv4(),
    email: 'sorokinvj@gmail.com',
    name: 'Vladislav Sorokin',
    tenantId: TENANTS[3].id,
    tenantName: TENANTS[3].name,
    tenantType: TENANTS[3].type,
    role: 'admin',
    createdAt: currentDate,
    version: CURRENT_SCHEMA_VERSION,
  },
  {
    id: uuidv4(),
    email: 'john@proxylink.co',
    name: 'John Walter',
    tenantId: TENANTS[3].id,
    tenantName: TENANTS[3].name,
    tenantType: TENANTS[3].type,
    role: 'admin',
    createdAt: currentDate,
    version: CURRENT_SCHEMA_VERSION,
  },
];

export const STANDARD_PASSWORD = 'q1w2e3';
