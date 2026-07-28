import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED_PATHS = [
  '/duzadmin',
  '/api/news',
  '/api/members',
  '/api/video',
  '/api/standingCommittee',
  '/api/introduction',
  '/api/aaIntroduction',
  '/api/mend',
  '/api/reports',
  '/api/upload',
];

const READ_ONLY_METHODS = ['GET', 'HEAD', 'OPTIONS'];

async function isTokenValid(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Allow read-only methods ONLY for /api/ routes (public data fetching).
  // /duzadmin GET requests always require auth.
  if (READ_ONLY_METHODS.includes(method) && pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const cookieToken = request.cookies.get('token')?.value;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  const token = cookieToken ?? bearerToken;

  if (!token || !(await isTokenValid(token))) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/duzadmin/:path*', '/api/:path*'],
};
