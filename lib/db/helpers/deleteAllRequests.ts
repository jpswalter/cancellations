// file: lib/db/deleteAllRequests.ts
import dotenv from 'dotenv';
dotenv.config();

import { initializeApp, getApps, cert } from 'firebase-admin/app';
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

export const deleteAllRequests = async () => {
  console.log('Initializing Firebase Admin...');
  const app = initializeFirebaseAdmin();
  console.log('Firebase Admin initialized successfully');

  const db = getFirestore(app);
  console.log(`Deleting all documents in collection: requests`);
  const collectionRef = db.collection('requests');
  const querySnapshot = await collectionRef.get();

  if (querySnapshot.empty) {
    console.log(`No documents found in collection: requests`);
    return;
  }

  const batch = db.batch();

  querySnapshot.forEach(doc => {
    console.log('Queueing deletion for doc:', doc.id);
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`All documents in collection "requests" have been deleted.`);
};

const deleteAllLogs = async () => {
  console.log('Initializing Firebase Admin...');
  const app = initializeFirebaseAdmin();
  console.log('Firebase Admin initialized successfully');

  const db = getFirestore(app);
  console.log(`Deleting all documents in collection: requestsLog`);
  const collectionRef = db.collection('requestsLog');
  const querySnapshot = await collectionRef.get();

  if (querySnapshot.empty) {
    console.log(`No documents found in collection: requestsLog`);
    return;
  }

  const batch = db.batch();

  querySnapshot.forEach(doc => {
    console.log('Queueing deletion for doc:', doc.id);
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`All documents in collection "logs" have been deleted.`);
};

(async () => {
  try {
    await deleteAllRequests();
    await deleteAllLogs();
    console.log('Deletion of all requests and logs completed successfully.');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
})();
