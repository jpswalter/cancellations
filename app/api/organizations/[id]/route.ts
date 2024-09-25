import { parseErrorMessage } from '@/utils/general';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';

export const DELETE = async (
  _: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> => {
  const db: Firestore = getFirestore();
  const auth = getAuth();
  const { id } = params;

  try {
    // Delete users associated with the tenant
    const usersSnapshot = await db
      .collection('users')
      .where('tenantId', '==', id)
      .get();

    const deletePromises = usersSnapshot.docs.map(async doc => {
      const userId = doc.id;
      await auth.deleteUser(userId);
      await doc.ref.delete();
    });

    await Promise.all(deletePromises);

    // Delete the tenant
    await db.collection('tenants').doc(id).delete();

    return NextResponse.json({
      message: 'Organization and all associated users deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /organizations/:id', parseErrorMessage(error));
    return NextResponse.json(
      {
        message: parseErrorMessage(error),
      },
      { status: 500 },
    );
  }
};
