import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup|reset-password|favicon|images|schedule-demo|article|$).*)',
  ],
};

// Simple in-memory cache
export const verificationCache = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function middleware(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const now = Date.now();
    const cachedTime = verificationCache.get(session);

    // If the session is in cache and not expired, allow the request
    if (cachedTime && now - cachedTime < CACHE_DURATION) {
      return NextResponse.next();
    }

    // Verify the session
    const verifyResponse = await fetch(
      new URL('/api/verify-session', request.url),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session }),
      },
    );

    if (!verifyResponse.ok) {
      console.error('Session verification failed in middleware');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Cache the verification result
    verificationCache.set(session, now);
    return NextResponse.next();
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
