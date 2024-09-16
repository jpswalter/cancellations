// file: app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { parseErrorMessage } from '@/utils/general';
import { User } from '@/lib/db/schema';

initializeFirebaseAdmin();

/**
 * Handles PATCH requests to update user information.
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} A response indicating success or failure.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const { firstName, lastName }: Partial<User> = await req.json();
  const { id } = params;

  if (!id) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing user information' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const db: Firestore = getFirestore();
  const userRef = db.collection('users').doc(id);

  try {
    await userRef.update({ firstName, lastName });

    return new NextResponse(JSON.stringify({ message: 'User updated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: 'Error updating user: ' + parseErrorMessage(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
