// file: lib/db/createuser.ts
import dotenv from 'dotenv';
dotenv.config();
import { getAuth } from 'firebase-admin/auth';
// Ensure the Firebase Admin SDK is initialized before running this script
import { initializeFirebaseAdmin } from '../../firebase/admin';
import { collections, User } from '../schema';
import { getFirestore } from 'firebase-admin/firestore';
import { USERS, STANDARD_PASSWORD } from '../seed/data';

const app = initializeFirebaseAdmin();

async function createUser(user: User) {
  const auth = getAuth();

  try {
    // Create user in Authentication

    const userRecord = await auth.createUser({
      uid: user.id,
      email: user.email,
      password: STANDARD_PASSWORD, // Standard password
      displayName: user.name,
    });
    // Set custom claims for JWT tokens
    await auth.setCustomUserClaims(userRecord.uid, {
      tenantId: user.tenantId,
      tenantType: user.tenantType,
      tenantName: user.tenantName,
      role: user.role,
    });

    const db = getFirestore(app);
    await db.collection(collections.users).doc(user.id).set(user);

    console.log(`User created successfully: ${user.email}`);
  } catch (error) {
    console.error(`Error creating admin user ${user.email}:`, error);
  }
}

createUser(USERS[4]).then(console.log).catch(console.error);
createUser(USERS[5]).then(console.log).catch(console.error);
