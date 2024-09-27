import dotenv from 'dotenv';
dotenv.config();
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '../../firebase/admin';
import { collections } from '../schema';

initializeFirebaseAdmin();

const convertMsToHours = (ms: number): number =>
  parseFloat((ms / (1000 * 60 * 60)).toFixed(2));

/**
 * Migrates avgResponseTime fields in all logs to the new format.
 */
async function migrateAvgResponseTime() {
  const firestore = getFirestore();
  const requestLogsCollection = firestore.collection(collections.requestsLog);
  const logsSnapshot = await requestLogsCollection.get();

  logsSnapshot.forEach(async doc => {
    const data = doc.data();

    if (data.avgResponseTime) {
      const { provider, proxy } = data.avgResponseTime;

      // Convert to new format
      const updatedAvgResponseTime = {
        provider: {
          ms: provider,
          hours: convertMsToHours(provider),
        },
        proxy: {
          ms: proxy,
          hours: convertMsToHours(proxy),
        },
      };

      // Update the document with the new avgResponseTime structure
      await requestLogsCollection.doc(doc.id).update({
        avgResponseTime: updatedAvgResponseTime,
      });

      console.log(`Updated log ${doc.id} with new avgResponseTime format.`);
    }
  });
}

// Run the migration
migrateAvgResponseTime()
  .then(() => {
    console.log('Migration complete!');
  })
  .catch(err => {
    console.error('Migration failed:', err);
  });
