import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { calculateStats } from '@/lib/firebase/stats';

initializeFirebaseAdmin();

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const tenantType = url.searchParams.get('tenantType') as
    | 'proxy'
    | 'provider'
    | null;
  const tenantId = url.searchParams.get('tenantId');

  if (!tenantType || !tenantId) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing tenant information' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const db: Firestore = getFirestore();

  try {
    const stats = await calculateStats(db, tenantType, tenantId);
    return new NextResponse(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Error fetching stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
