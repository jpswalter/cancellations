import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { collections, Invitation } from '@/lib/db/schema';
import { sendEmailInvitation } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { sendTo, isAdmin, invitedBy, tenantType, tenantName, tenantId } =
      await request.json();

    if (!sendTo || !invitedBy || !tenantType || !tenantName || !tenantId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    const db = getFirestore();

    // Create a new invitation
    const newInvitation: Invitation = {
      id: uuidv4(),
      email: sendTo,
      tenantId,
      tenantName,
      tenantType,
      isAdmin,
      invitedBy,
      invitedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiration
    };

    // Save the invitation to Firestore
    await db
      .collection(collections.invitations)
      .doc(newInvitation.id)
      .set(newInvitation);

    // Send the email invitation
    await sendEmailInvitation({
      sendTo,
      isAdmin,
      invitedBy,
      tenantType,
      tenantName,
      tenantId,
    });

    return NextResponse.json(
      { message: 'Invitation sent successfully', invitation: newInvitation },
      { status: 200 },
    );
  } catch (error) {
    console.error('Failed to send invitation:', error);
    return NextResponse.json(
      { message: 'Failed to send the invitation' },
      { status: 500 },
    );
  }
}
