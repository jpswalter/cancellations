// file: lib/db/init.ts
import dotenv from 'dotenv';
dotenv.config();
import { initializeFirebaseAdmin } from '../firebase/admin';
const app = initializeFirebaseAdmin();

import { getFirestore } from 'firebase-admin/firestore';
import { collections } from './schema';
import { getAuth } from 'firebase-admin/auth';
import { STANDARD_PASSWORD, TENANTS, USERS } from './seed/data';

export async function initializeDatabase() {
  try {
    const db = getFirestore(app);
    console.log('Firestore instance obtained');

    // Test connection
    console.log('Testing Firestore connection...');
    const testDoc = await db.collection('test').doc('testDoc').get();
    if (testDoc.exists) {
      console.log('Successfully connected to Firestore');
    } else {
      console.log('Connected to Firestore, but test document does not exist');
    }

    // Initialize test data
    await initializeTestData(db);
  } catch (error) {
    console.error('Error in initializeDatabase:', error);
    throw error;
  }
}

async function initializeTestData(db: FirebaseFirestore.Firestore) {
  const auth = getAuth();

  // Create test tenants
  for (const tenant of TENANTS) {
    await db.collection(collections.tenants).doc(tenant.id).set(tenant);
  }
  console.log(
    'Created successfully the following tenants:',
    TENANTS.map(t => t.name),
  );

  // Create test users
  for (const user of USERS) {
    try {
      // Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        uid: user.id,
        email: user.email,
        password: STANDARD_PASSWORD,
      });

      // Set custom claims for JWT tokens
      await auth.setCustomUserClaims(userRecord.uid, {
        tenantId: user.tenantId,
        tenantType: user.tenantType,
        tenantName: user.tenantName,
        role: user.role,
      });

      // Create user document in Firestore
      await db.collection(collections.users).doc(user.id).set(user);

      console.log(`User created successfully: ${user.email}`);
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }

  console.log(
    'Seed data initialized for the project with id',
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
}

initializeDatabase()
  .then(() => console.log('Database initialized successfully'))
  .catch(console.error);
