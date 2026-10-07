import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  checkLoginAllowed,
  getClientIP,
  recordLoginFailure,
  recordLoginSuccess,
  resetLoginRateLimit,
} from "@/utils/loginRateLimit";

beforeEach(() => {
  resetLoginRateLimit();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("login rate limit", () => {
  it("lets the account in again once the 15 minute window has passed", () => {
    for (let i = 0; i < 5; i++) recordLoginFailure("1.1.1.1", "a@a.mn");
    const blocked = checkLoginAllowed("1.1.1.1", "a@a.mn");
    expect(blocked).toMatchObject({ allowed: false, by: "email" });

    vi.advanceTimersByTime(15 * 60 * 1000 + 1000);
    expect(checkLoginAllowed("1.1.1.1", "a@a.mn")).toEqual({ allowed: true });
  });

  it("reports the remaining wait in seconds", () => {
    for (let i = 0; i < 5; i++) recordLoginFailure("1.1.1.1", "a@a.mn");
    vi.advanceTimersByTime(5 * 60 * 1000);
    const gate = checkLoginAllowed("1.1.1.1", "a@a.mn");
    expect(gate.allowed).toBe(false);
    if (!gate.allowed) expect(gate.retryAfterSeconds).toBe(10 * 60);
  });

  it("uses a much larger cap per IP than per email (shared proxy IPs)", () => {
    // 29 failures across different emails from one IP must not lock the IP.
    for (let i = 0; i < 29; i++) recordLoginFailure("2.2.2.2", `user${i}@a.mn`);
    expect(checkLoginAllowed("2.2.2.2", "fresh@a.mn")).toEqual({ allowed: true });
    // The 30th does.
    recordLoginFailure("2.2.2.2", "user30@a.mn");
    expect(checkLoginAllowed("2.2.2.2", "fresh@a.mn")).toMatchObject({
      allowed: false,
      by: "ip",
    });
  });

  it("success clears both counters", () => {
    for (let i = 0; i < 4; i++) recordLoginFailure("3.3.3.3", "a@a.mn");
    recordLoginSuccess("3.3.3.3", "a@a.mn");
    recordLoginFailure("3.3.3.3", "a@a.mn");
    expect(checkLoginAllowed("3.3.3.3", "a@a.mn")).toEqual({ allowed: true });
  });
});

describe("getClientIP", () => {
  const req = (headers: Record<string, string>) =>
    new Request("http://localhost/", { headers });

  it("takes the left-most X-Forwarded-For entry", () => {
    expect(getClientIP(req({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" }))).toBe("9.9.9.9");
  });
  it("falls back to X-Real-IP, then 'unknown'", () => {
    expect(getClientIP(req({ "x-real-ip": "8.8.8.8" }))).toBe("8.8.8.8");
    expect(getClientIP(req({}))).toBe("unknown");
  });
});
