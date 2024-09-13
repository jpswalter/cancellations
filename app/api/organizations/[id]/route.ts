import { parseErrorMessage } from '@/utils/general';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

export const DELETE = async (
  _: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> => {
  const db: Firestore = getFirestore();
  const { id } = params;

  try {
    await db.collection('tenants').doc(id).delete();
    return NextResponse.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error DELETE:', parseErrorMessage(error));
    return NextResponse.json(
      {
        message: parseErrorMessage(error),
      },
      { status: 500 },
    );
  }
};
