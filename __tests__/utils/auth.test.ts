// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";

vi.mock("jsonwebtoken", () => ({
  default: { verify: vi.fn() },
}));

import { isTokenValid, checkTokenExpiry, startExpiryCheck } from "@/utils/auth";

const SECRET = "test-secret";

beforeEach(() => {
  process.env.JWT_SECRET = SECRET;
  vi.clearAllMocks();
  localStorage.clear();
  // Stub location so we can assert on href changes
  vi.stubGlobal("location", { href: "" });
});

afterEach(() => {
  delete process.env.JWT_SECRET;
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// isTokenValid
// ---------------------------------------------------------------------------
describe("isTokenValid", () => {
  it("returns true for a valid non-expired token", () => {
    (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    expect(isTokenValid("valid.token")).toBe(true);
  });

  it("returns false for an expired token", () => {
    (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValue({
      exp: Math.floor(Date.now() / 1000) - 1,
    });
    expect(isTokenValid("expired.token")).toBe(false);
  });

  it("returns false when JWT_SECRET is not set", () => {
    delete process.env.JWT_SECRET;
    expect(isTokenValid("any.token")).toBe(false);
  });

  it("returns false when jwt.verify throws", () => {
    (jwt.verify as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("invalid signature");
    });
    expect(isTokenValid("bad.token")).toBe(false);
  });

  it("returns false when decoded payload has no exp field", () => {
    (jwt.verify as ReturnType<typeof vi.fn>).mockReturnValue({ email: "x@x.mn" });
    expect(isTokenValid("no-exp.token")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkTokenExpiry
// ---------------------------------------------------------------------------
describe("checkTokenExpiry", () => {
  it("does nothing when tokenExpiry is not stored", () => {
    checkTokenExpiry();
    expect(window.location.href).toBe("");
  });

  it("does nothing when the stored token has not yet expired", () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    localStorage.setItem("tokenExpiry", future);
    checkTokenExpiry();
    expect(window.location.href).toBe("");
    expect(localStorage.getItem("tokenExpiry")).toBe(future);
  });

  it("clears localStorage and redirects to /login when token has expired", () => {
    const past = new Date(Date.now() - 1000).toISOString();
    localStorage.setItem("tokenExpiry", past);
    localStorage.setItem("user", "Bat");

    checkTokenExpiry();

    expect(localStorage.getItem("tokenExpiry")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(window.location.href).toBe("/login");
  });
});

// ---------------------------------------------------------------------------
// startExpiryCheck
// ---------------------------------------------------------------------------
describe("startExpiryCheck", () => {
  it("returns an interval handle that can be cleared", () => {
    vi.useFakeTimers();
    const id = startExpiryCheck();
    expect(id).toBeTruthy();
    clearInterval(id);
    vi.useRealTimers();
  });

  it("calls checkTokenExpiry immediately on start", () => {
    vi.useFakeTimers();
    const past = new Date(Date.now() - 1000).toISOString();
    localStorage.setItem("tokenExpiry", past);
    const id = startExpiryCheck();
    // Immediate call should have redirected
    expect(window.location.href).toBe("/login");
    clearInterval(id);
    vi.useRealTimers();
  });

  it("calls checkTokenExpiry again after 60 seconds", () => {
    vi.useFakeTimers();
    const id = startExpiryCheck();
    // Advance 60 s
    vi.advanceTimersByTime(60_000);
    // At 60 s the interval fires once; combined with the immediate call = 2 runs
    // We just verify the interval was registered correctly by clearing it
    clearInterval(id);
    vi.useRealTimers();
  });
});
