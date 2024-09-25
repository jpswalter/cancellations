import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { sendEmailInvitation } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const {
      sendTo,
      invitedBy,
      tenantType,
      tenantName,
      tenantId,
      isAdmin,
      isResend,
    } = await request.json();

    const db = getFirestore();
    const invitationsRef = db.collection('invitations');
    const existingInvitationQuery = await invitationsRef
      .where('email', '==', sendTo)
      .where('tenantId', '==', tenantId)
      .limit(1)
      .get();

    if (!existingInvitationQuery.empty && isResend) {
      const existingInvitation = existingInvitationQuery.docs[0];
      await existingInvitation.ref.update({
        invitedAt: new Date().toISOString(),
        invitedBy,
      });

      const updatedInvitation = await existingInvitation.ref.get();

      await sendEmailInvitation({
        sendTo,
        isAdmin,
        invitedBy,
        tenantType,
        tenantName,
        tenantId,
      });

      return NextResponse.json({
        id: updatedInvitation.id,
        ...updatedInvitation.data(),
      });
    }

    if (existingInvitationQuery.empty && !isResend) {
      const EXPIRATION_TIME_24H = 24 * 60 * 60 * 1000; // 24 hours
      const newInvitationRef = await invitationsRef.add({
        email: sendTo,
        invitedBy,
        tenantType,
        tenantName,
        tenantId,
        isAdmin: isAdmin ?? false,
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(
          new Date().getTime() + EXPIRATION_TIME_24H,
        ).toISOString(),
      });

      const newInvitation = await newInvitationRef.get();

      await sendEmailInvitation({
        sendTo,
        isAdmin,
        invitedBy,
        tenantType,
        tenantName,
        tenantId,
      });

      return NextResponse.json({
        id: newInvitation.id,
        ...newInvitation.data(),
      });
    } else if (!existingInvitationQuery.empty && !isResend) {
      return NextResponse.json(
        { error: 'Invitation already exists' },
        { status: 400 },
      );
    } else {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error('Error processing invitation:', error);
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 },
    );
  }
}
