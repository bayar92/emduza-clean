import { cookies } from 'next/headers';
import { isTokenValid } from '@/utils/auth';

/**
 * Verifies the admin session token (cookie, or `Authorization: Bearer`).
 *
 * proxy.ts already blocks unauthenticated writes, but it lets every GET on
 * /api/* through and is a single layer. Handlers that expose drafts or change
 * what every visitor sees call this as well (defence in depth).
 */
export async function isAdminRequest(req: Request): Promise<boolean> {
  const cookieToken = (await cookies()).get('token')?.value;
  const auth = req.headers.get('authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
  const token = cookieToken ?? bearer;
  return !!token && isTokenValid(token);
}
