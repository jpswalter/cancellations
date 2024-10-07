import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { collections, Invitation } from '@/lib/db/schema';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 },
      );
    }

    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    const db = getFirestore();

    // Query Firestore for invitations
    const invitationsSnapshot = await db
      .collection(collections.invitations)
      .where('tenantId', '==', tenantId)
      .get();

    const invitations: Invitation[] = invitationsSnapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Invitation,
    );

    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Failed to fetch invitations:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching invitations' },
      { status: 500 },
    );
  }
}
