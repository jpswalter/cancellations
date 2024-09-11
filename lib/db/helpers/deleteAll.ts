// file: lib/db/deleteAllCollections.ts
import dotenv from 'dotenv';
dotenv.config();

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    return initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getApps()[0];
};

export const deletAllCollections = async () => {
  console.log('Initializing Firebase Admin...');
  const app = initializeFirebaseAdmin();
  console.log('Firebase Admin initialized successfully');

  const db = getFirestore(app);
  console.log('Deleting all collections...');
  const collections = await db.listCollections();

  for (const collection of collections) {
    console.log('Deleting documents in collection:', collection.id);
    const documents = await collection.listDocuments();
    const batch = db.batch();

    documents.forEach(doc => {
      batch.delete(doc);
    });

    await batch.commit();
  }

  console.log('All documents in all collections have been deleted.');
};

const deleteAllUsers = async () => {
  const app = initializeFirebaseAdmin();
  const auth = getAuth(app);
  const users = await auth.listUsers();
  for (const user of users.users) {
    await auth.deleteUser(user.uid);
  }
  console.log('All users have been deleted.');
};

// Self-invoking async function to run the script
(async () => {
  try {
    await deletAllCollections();
    await deleteAllUsers();
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
})();
