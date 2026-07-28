import { prisma } from '@/utils/prisma';
import { env } from '@/utils/env';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getClientIP(req: Request): string {
  // Take the last hop, not the first: X-Forwarded-For is built by each proxy
  // appending the address it saw, so the entry closest to us (added by our
  // own trusted reverse proxy) is the last one. Trusting the first entry
  // would let a client set an arbitrary value and pick their own rate-limit
  // bucket, bypassing the lockout entirely.
  const chain = req.headers.get('x-forwarded-for')?.split(',');
  const lastHop = chain?.[chain.length - 1]?.trim();
  return lastHop || 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) return false;

  entry.count += 1;
  return true;
}

function resetRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(req: Request) {
  const ip = getClientIP(req);

  if (!checkRateLimit(ip)) {
    return Response.json(
      {
        error:
          'Хэт олон оролдлого хийсэн байна. 15 минутын дараа дахин оролдоно уу.',
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = jwt.sign({ email }, env.JWT_SECRET, { expiresIn: '8h' });

    resetRateLimit(ip);

    const response = NextResponse.json({ success: true });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login failed:', error);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}
