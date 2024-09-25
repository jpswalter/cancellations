import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(
  _: NextRequest,
  { params }: { params: { tenantId: string } },
): Promise<NextResponse> {
  const { tenantId } = params;

  if (!tenantId) {
    return NextResponse.json(
      { error: 'Tenant ID is required' },
      { status: 400 },
    );
  }

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    const tenantDoc = await db.collection('tenants').doc(tenantId).get();

    if (!tenantDoc.exists) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const tenantData = tenantDoc.data();

    return NextResponse.json(tenantData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { tenantId: string } },
): Promise<NextResponse> {
  const { tenantId } = params;
  const data = await request.json();

  if (!tenantId) {
    return NextResponse.json(
      { error: 'Tenant ID is required' },
      { status: 400 },
    );
  }

  try {
    initializeFirebaseAdmin();
    const db = getFirestore();

    const tenantDoc = await db.collection('tenants').doc(tenantId).get();

    if (!tenantDoc.exists) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    await tenantDoc.ref.update(data);

    return NextResponse.json(
      { message: 'Tenant updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
