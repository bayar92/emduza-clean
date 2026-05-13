import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return NextResponse.json({ error: 'Server error' }, { status: 500 });

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return NextResponse.json({ email: payload.email });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
