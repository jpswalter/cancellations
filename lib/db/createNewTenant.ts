// file: lib/db/createNewTenant.ts
import dotenv from 'dotenv';
dotenv.config();
import { initializeFirebaseAdmin } from '../firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { v4 as uuidv4 } from 'uuid';
import { collections, CURRENT_SCHEMA_VERSION, Tenant, User } from './schema';

const app = initializeFirebaseAdmin();
const db = getFirestore(app);
const auth = getAuth();

export async function createDemoCorpTenant(): Promise<Tenant> {
  const demoCorp: Tenant = {
    id: uuidv4(),
    name: 'Demo Corp',
    type: 'provider',
    createdAt: new Date().toISOString(),
    active: true,
    version: CURRENT_SCHEMA_VERSION,
    requiredCustomerInfo: [
      'customerName',
      'customerEmail',
      'accountNumber',
      'lastFourCCDigits',
    ],
  };

  await db.collection(collections.tenants).doc(demoCorp.id).set(demoCorp);
  console.log('Demo Corp tenant created successfully');
  return demoCorp;
}

export async function createDemoCorpUsers(tenantId: string): Promise<void> {
  const users: User[] = [
    {
      id: uuidv4(),
      email: 'employee1@democorp.com',
      name: 'John Doe',
      tenantId: tenantId,
      tenantName: 'Demo Corp',
      tenantType: 'provider',
      role: 'user',
      createdAt: new Date().toISOString(),
      version: CURRENT_SCHEMA_VERSION,
    },
    {
      id: uuidv4(),
      email: 'admin@democorp.com',
      name: 'Jane Smith',
      tenantId: tenantId,
      tenantName: 'Demo Corp',
      tenantType: 'provider',
      role: 'admin',
      createdAt: new Date().toISOString(),
      version: CURRENT_SCHEMA_VERSION,
    },
  ];

  for (const user of users) {
    try {
      const userRecord = await auth.createUser({
        uid: user.id,
        email: user.email,
        password: 'q1w2e3',
        displayName: user.name,
      });

      await auth.setCustomUserClaims(userRecord.uid, {
        tenantId: user.tenantId,
        tenantType: user.tenantType,
        tenantName: user.tenantName,
        role: user.role,
      });

      await db.collection(collections.users).doc(user.id).set(user);
      console.log(`User created successfully: ${user.email}`);
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }
}

// Example usage:
async function main() {
  const demoCorp = await createDemoCorpTenant();
  await createDemoCorpUsers(demoCorp.id);
}
main().catch(console.error);
