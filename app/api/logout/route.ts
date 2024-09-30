// app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { verificationCache } from '@/middleware';
import { AUTH_COOKIE_NAME } from '@/constants/app.contants';

export async function POST() {
  try {
    initializeFirebaseAdmin();
    const auth = getAuth();

    const sessionCookie = cookies().get(AUTH_COOKIE_NAME)?.value;

    if (sessionCookie) {
      // Verify the session cookie. In this case, we want to revoke
      // the session cookie, so we're passing in checkRevoked:false
      const decodedClaims = await auth.verifySessionCookie(
        sessionCookie,
        false,
      );
      // Revoke refresh tokens for the user
      await auth.revokeRefreshTokens(decodedClaims.sub);

      verificationCache.delete(sessionCookie);
    }

    const response = NextResponse.json({ status: 'success' }, { status: 200 });

    // Clear the session cookie
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
