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

    console.log(`Admin user created successfully: ${user.email}`);
  } catch (error) {
    console.error(`Error creating admin user ${user.email}:`, error);
  }
}

const user = USERS[0];
createUser(user)
  .then(() => console.log('User', user.email, 'created successfully'))
  .catch(console.error);
