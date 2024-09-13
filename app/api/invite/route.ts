import { NextResponse } from 'next/server';
import { sendEmailInvitation } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { sendTo, isAdmin, invitedBy } = await request.json();

    await sendEmailInvitation({ sendTo, isAdmin, invitedBy });

    return NextResponse.json(
      { message: 'Invitation sent successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { message: 'Failed to send the message' },
      { status: 500 },
    );
  }
}
