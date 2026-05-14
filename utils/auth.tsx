import jwt from 'jsonwebtoken';
import { env } from './env';

export function isTokenValid(token: string) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    return decoded.exp ? decoded.exp > Date.now() / 1000 : false;
  } catch {
    return false;
  }
}

export const checkTokenExpiry = () => {
  // Guard: browser-only APIs — do nothing in SSR/Node context
  if (typeof window === 'undefined') return;

  const tokenExpiry = localStorage.getItem('tokenExpiry');
  if (tokenExpiry) {
    const expiryTime = new Date(tokenExpiry).getTime();
    const currentTime = new Date().getTime();
    if (currentTime >= expiryTime) {
      localStorage.clear();
      window.location.href = '/login';
    }
  }
};

// Returns the interval ID so callers can clear it (e.g. on component unmount)
export const startExpiryCheck = (): ReturnType<typeof setInterval> => {
  checkTokenExpiry();
  return setInterval(checkTokenExpiry, 60000);
};
