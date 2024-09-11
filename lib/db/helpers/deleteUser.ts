// file: lib/db/deleteUser.ts
import dotenv from 'dotenv';
dotenv.config();
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure the Firebase Admin SDK is initialized before running this script
import { initializeFirebaseAdmin } from '../../firebase/admin';

const EMAIL_TO_DELETE = 'admin@espn.com';

initializeFirebaseAdmin();

const auth = getAuth();
const firestore = getFirestore();

async function deleteUser(email: string) {
  try {
    // Fetch the user record by email
    const userRecord = await auth.getUserByEmail(email);

    // Remove user from Authentication
    await auth.deleteUser(userRecord.uid);

    // Remove user record from Firestore
    const userDoc = firestore.collection('users').doc(userRecord.uid);
    await userDoc.delete();

    console.log(`User deleted successfully: ${email}`);
  } catch (error) {
    console.error(`Error deleting admin user ${email}:`, error);
  }
}

deleteUser(EMAIL_TO_DELETE)
  .then(() => console.log(`Admin user ${EMAIL_TO_DELETE} deleted successfully`))
  .catch(console.error);
