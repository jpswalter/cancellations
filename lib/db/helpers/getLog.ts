import dotenv from 'dotenv';
dotenv.config();

import { initializeFirebaseAdmin } from '../../firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { collections } from '../schema';

const app = initializeFirebaseAdmin();
const db = getFirestore(app);

export async function getLogById(logId: string) {
  try {
    const docRef = db.collection(collections.requestsLog).doc(logId);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log('No such document!');
      return null;
    } else {
      return { id: doc.id, ...doc.data() };
    }
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

getLogById('ahrpIwvVqkaHJPZZTszK').then(log => {
  console.log(JSON.stringify(log, (key, value) => value, 2));
});
