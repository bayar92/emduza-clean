import { prisma } from '@/utils/prisma';
import { env } from '@/utils/env';
import {
  checkLoginAllowed,
  getClientIP,
  recordLoginFailure,
  recordLoginSuccess,
} from '@/utils/loginRateLimit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) {
    return Response.json(
      { error: 'Имэйл болон нууц үгээ оруулна уу.' },
      { status: 400 }
    );
  }

  const ip = getClientIP(req);

  const gate = checkLoginAllowed(ip, email);
  if (!gate.allowed) {
    console.warn(`[login] blocked by ${gate.by} limit (ip=${ip})`);
    const minutes = Math.ceil(gate.retryAfterSeconds / 60);
    return Response.json(
      {
        error: `Хэт олон оролдлого хийсэн байна. ${minutes} минутын дараа дахин оролдоно уу.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(gate.retryAfterSeconds) },
      }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      recordLoginFailure(ip, email);
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      recordLoginFailure(ip, email);
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = jwt.sign({ email }, env.JWT_SECRET, { expiresIn: '8h' });

    recordLoginSuccess(ip, email);

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
    // Server-side failures (DB down, missing JWT_SECRET, ...) are not the
    // user's fault, so they deliberately do not count towards the lockout.
    console.error('Login failed:', error);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}
