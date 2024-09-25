import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { parseErrorMessage } from '@/utils/general';
import { collections, User } from '@/lib/db/schema';

initializeFirebaseAdmin();

export async function GET(): Promise<NextResponse> {
  const db = getFirestore();

  try {
    const usersSnapshot = await db.collection(collections.users).get();
    const users: User[] = usersSnapshot.docs.map(doc => doc.data() as User);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', parseErrorMessage(error));
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}
