// file: app/api/tenants/route.ts

import { NextResponse } from 'next/server';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

initializeFirebaseAdmin();

/**
 * Handles GET requests to fetch all tenants.
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} A response containing the fetched tenants or an error message.
 */
export async function GET(): Promise<NextResponse> {
  const db: Firestore = getFirestore();
  const tenantsRef = db.collection('tenants');

  try {
    const snapshot = await tenantsRef.get();
    const tenants = snapshot.docs.map(doc => doc.data());

    return new NextResponse(JSON.stringify(tenants), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Error fetching tenants' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
