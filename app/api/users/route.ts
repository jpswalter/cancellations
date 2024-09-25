import { NextResponse } from 'next/server';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

initializeFirebaseAdmin();

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');

  console.log('tenantId', tenantId);

  if (!tenantId) {
    return new NextResponse(
      JSON.stringify({ error: 'Tenant ID is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const db: Firestore = getFirestore();
  const usersRef = db.collection('users').where('tenantId', '==', tenantId);

  try {
    const snapshot = await usersRef.get();
    const users = snapshot.docs.map(doc => doc.data());

    return new NextResponse(JSON.stringify(users), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Error fetching users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
