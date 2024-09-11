// file: lib/db/createNewTenant.ts
import dotenv from 'dotenv';
dotenv.config();
import { initializeFirebaseAdmin } from '../../firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';

import { collections, Tenant } from '../schema';

const app = initializeFirebaseAdmin();
const db = getFirestore(app);

export async function createTenant(tenant: Tenant): Promise<Tenant> {
  await db.collection(collections.tenants).doc(tenant.id).set(tenant);
  console.log('Tenant', tenant.name, 'created successfully');
  return tenant;
}
