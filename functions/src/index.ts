import { calculateTenantStats } from './calculateTenantStats';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { defineString } from 'firebase-functions/params';

const FIREBASE_CLIENT_EMAIL = defineString('FIREBASE_CLIENT_EMAIL');
const FIREBASE_PROJECT_ID = defineString('FIREBASE_PROJECT_ID');
const FIREBASE_PRIVATE_KEY = defineString('FIREBASE_PRIVATE_KEY');

export function initializeFirebaseAdmin() {
  if (!FIREBASE_PROJECT_ID.value()) {
    throw new Error('FIREBASE_PROJECT_ID is not set');
  }

  if (!FIREBASE_CLIENT_EMAIL.value()) {
    throw new Error('FIREBASE_CLIENT_EMAIL is not set');
  }

  if (!FIREBASE_PRIVATE_KEY.value()) {
    throw new Error('FIREBASE_PRIVATE_KEY is not set');
  }

  if (getApps().length === 0) {
    return initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID.value(),
        clientEmail: FIREBASE_CLIENT_EMAIL.value(),
        privateKey: FIREBASE_PRIVATE_KEY?.value().replace(/\\n/g, '\n'),
      }),
    });
  } else {
    return getApps()[0];
  }
}

export { calculateTenantStats };
