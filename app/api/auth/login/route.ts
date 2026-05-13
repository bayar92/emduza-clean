import { prisma } from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
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

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const token = jwt.sign({ email }, secret, { expiresIn: '8h' });

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
