/**
 * Brute-force protection for the login endpoint.
 *
 * Two independent counters of *failed* attempts within a sliding window:
 *
 *  - per email (the real protection): 5 failures lock that account for 15 min
 *    no matter which IP the attempts come from, so a forged or mis-detected
 *    client IP cannot be used to bypass it, and one locked account never
 *    affects anyone else.
 *  - per IP (best effort, generous cap): throttles one source spraying many
 *    emails. Behind a reverse proxy (Railway) the client IP is not reliably
 *    known — X-Forwarded-For handling differs between routing paths — so this
 *    cap is deliberately high. A previous version counted ALL attempts per
 *    "last X-Forwarded-For hop", which on a shared edge IP put every visitor
 *    in one bucket and locked admins out after 5 tries in total.
 *
 * State is in memory: it resets on restart/redeploy and is per instance.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_EMAIL = 5;
const MAX_FAILURES_PER_IP = 30;
// Bound memory: an attacker can invent unlimited emails.
const MAX_TRACKED_KEYS = 5000;

type Entry = { count: number; resetAt: number };

class FailureCounter {
  private hits = new Map<string, Entry>();

  constructor(private readonly max: number) {}

  /** Seconds until the key is allowed again, or 0 if it is not blocked. */
  retryAfterSeconds(key: string, now = Date.now()): number {
    const entry = this.hits.get(key);
    if (!entry || now >= entry.resetAt) return 0;
    return entry.count >= this.max ? Math.ceil((entry.resetAt - now) / 1000) : 0;
  }

  recordFailure(key: string, now = Date.now()): void {
    const entry = this.hits.get(key);
    if (!entry || now >= entry.resetAt) {
      if (this.hits.size >= MAX_TRACKED_KEYS) this.prune(now);
      this.hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return;
    }
    entry.count += 1;
  }

  reset(key: string): void {
    this.hits.delete(key);
  }

  clear(): void {
    this.hits.clear();
  }

  private prune(now: number): void {
    for (const [key, entry] of this.hits) {
      if (now >= entry.resetAt) this.hits.delete(key);
    }
    // Still full of live entries: drop the oldest ones (Map keeps insertion order).
    for (const key of this.hits.keys()) {
      if (this.hits.size < MAX_TRACKED_KEYS) break;
      this.hits.delete(key);
    }
  }
}

const byEmail = new FailureCounter(MAX_FAILURES_PER_EMAIL);
const byIp = new FailureCounter(MAX_FAILURES_PER_IP);

function emailKey(email: string): string {
  return email.trim().toLowerCase().slice(0, 254);
}

/**
 * Best-effort client IP. Railway documents the left-most X-Forwarded-For entry
 * as the connecting client, but reports are mixed (and a client can prepend its
 * own values on some paths), which is why this only feeds the generous
 * secondary limit and never the per-email one.
 */
export function getClientIP(req: Request): string {
  const first = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return first || req.headers.get('x-real-ip')?.trim() || 'unknown';
}

export type LoginGate =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number; by: 'email' | 'ip' };

export function checkLoginAllowed(ip: string, email: string): LoginGate {
  const emailWait = byEmail.retryAfterSeconds(emailKey(email));
  if (emailWait > 0) return { allowed: false, retryAfterSeconds: emailWait, by: 'email' };

  const ipWait = byIp.retryAfterSeconds(ip);
  if (ipWait > 0) return { allowed: false, retryAfterSeconds: ipWait, by: 'ip' };

  return { allowed: true };
}

export function recordLoginFailure(ip: string, email: string): void {
  byEmail.recordFailure(emailKey(email));
  byIp.recordFailure(ip);
}

export function recordLoginSuccess(ip: string, email: string): void {
  byEmail.reset(emailKey(email));
  byIp.reset(ip);
}

/** Test helper. */
export function resetLoginRateLimit(): void {
  byEmail.clear();
  byIp.clear();
}
