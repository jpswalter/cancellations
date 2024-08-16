import dotenv from 'dotenv';
dotenv.config();
import { getAuth } from 'firebase-admin/auth';
import { v4 as uuidv4 } from 'uuid';

// Ensure the Firebase Admin SDK is initialized before running this script
import { initializeFirebaseAdmin } from '../firebase/admin';
import { collections, CURRENT_SCHEMA_VERSION } from './schema';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeFirebaseAdmin();

async function createAdminUser() {
  const auth = getAuth();

  const adminUser = {
    id: uuidv4(),
    email: 'admin@espn.com',
    name: 'Admin ESPN',
    tenantId: 'ba9270be-6274-41c0-be0a-73e4fe639d39', // You should replace this with the actual ESPN tenant ID
    tenantName: 'ESPN',
    tenantType: 'provider',
    role: 'admin',
    createdAt: new Date().toISOString(),
    version: CURRENT_SCHEMA_VERSION, // Ensure this is imported or correctly defined
  };

  try {
    // Create user in Authentication
    const userRecord = await auth.createUser({
      uid: adminUser.id,
      email: adminUser.email,
      password: 'q1w2e3', // Standard password
      displayName: adminUser.name,
    });

    // Set custom claims for JWT tokens
    await auth.setCustomUserClaims(userRecord.uid, {
      tenantId: adminUser.tenantId,
      tenantType: adminUser.tenantType,
      tenantName: adminUser.tenantName,
      role: adminUser.role,
    });

    const db = getFirestore(app);
    await db.collection(collections.users).doc(adminUser.id).set(adminUser);

    console.log(`Admin user created successfully: ${adminUser.email}`);
  } catch (error) {
    console.error(`Error creating admin user ${adminUser.email}:`, error);
  }
}

createAdminUser()
  .then(() => console.log('Admin user created successfully'))
  .catch(console.error);
