import { describe, it, expect, vi, beforeEach } from "vitest";

// --- mocks ----------------------------------------------------------------
const mockPrisma = { user: { findUnique: vi.fn() } };
vi.mock("@/utils/prisma", () => ({ prisma: mockPrisma }));

vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn() },
}));

vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn().mockReturnValue("mock.jwt.token") },
}));

import bcrypt from "bcryptjs";
import { resetLoginRateLimit } from "@/utils/loginRateLimit";

const { POST: loginPOST } = await import("@/app/api/auth/login/route");
const { POST: logoutPOST } = await import("@/app/api/auth/logout/route");

const USER = { id: 1, email: "admin@test.mn", password: "hashed" };

function loginReq(body: object, ip = "127.0.0.1") {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  resetLoginRateLimit();
  process.env.JWT_SECRET = "test-secret";
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------
describe("POST /api/auth/login", () => {
  it("returns 200 and sets cookie on valid credentials", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(USER);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    const res = await loginPOST(loginReq({ email: "admin@test.mn", password: "pass" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(res.headers.get("set-cookie")).toContain("token=");
  });

  it("returns 401 when user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await loginPOST(loginReq({ email: "x@x.mn", password: "p" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when password is wrong", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(USER);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    const res = await loginPOST(loginReq({ email: "admin@test.mn", password: "wrong" }));
    expect(res.status).toBe(401);
  });

  it("returns 500 when JWT_SECRET is not set", async () => {
    delete process.env.JWT_SECRET;
    mockPrisma.user.findUnique.mockResolvedValue(USER);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const res = await loginPOST(loginReq({ email: "admin@test.mn", password: "pass" }));
    expect(res.status).toBe(500);
  });

  it("returns 429 with Retry-After once an email has 5 failed attempts", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    for (let i = 0; i < 5; i++) {
      const res = await loginPOST(loginReq({ email: "x@x.mn", password: "p" }));
      expect(res.status).toBe(401);
    }
    const res = await loginPOST(loginReq({ email: "x@x.mn", password: "p" }));
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("retry-after"))).toBeGreaterThan(0);
    const body = await res.json();
    expect(body.error).toMatch(/минутын дараа/);
  });

  it("does not let a locked-out email affect other accounts on the same IP", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    for (let i = 0; i < 6; i++) {
      await loginPOST(loginReq({ email: "x@x.mn", password: "p" }, "10.0.0.5"));
    }
    mockPrisma.user.findUnique.mockResolvedValue(USER);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const res = await loginPOST(
      loginReq({ email: "admin@test.mn", password: "pass" }, "10.0.0.5")
    );
    expect(res.status).toBe(200);
  });

  it("cannot be bypassed by rotating a forged X-Forwarded-For", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    for (let i = 0; i < 5; i++) {
      await loginPOST(loginReq({ email: "x@x.mn", password: "p" }, `1.2.3.${i}`));
    }
    const res = await loginPOST(loginReq({ email: "x@x.mn", password: "p" }, "9.9.9.9"));
    expect(res.status).toBe(429);
  });

  it("is case-insensitive about the email when counting failures", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    for (let i = 0; i < 5; i++) {
      await loginPOST(loginReq({ email: i % 2 ? "X@X.MN" : "x@x.mn", password: "p" }));
    }
    const res = await loginPOST(loginReq({ email: "x@X.mn", password: "p" }));
    expect(res.status).toBe(429);
  });

  it("clears the failure count after a successful login", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(USER);
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    for (let i = 0; i < 4; i++) {
      await loginPOST(loginReq({ email: "admin@test.mn", password: "bad" }));
    }
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    expect(
      (await loginPOST(loginReq({ email: "admin@test.mn", password: "ok" }))).status
    ).toBe(200);

    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    for (let i = 0; i < 4; i++) {
      const res = await loginPOST(loginReq({ email: "admin@test.mn", password: "bad" }));
      expect(res.status).toBe(401);
    }
  });

  it("does not count server errors as failed attempts", async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error("db down"));
    for (let i = 0; i < 8; i++) {
      const res = await loginPOST(loginReq({ email: "admin@test.mn", password: "p" }));
      expect(res.status).toBe(500);
    }
  });

  it("returns 400 for a malformed or incomplete body", async () => {
    const noPassword = await loginPOST(loginReq({ email: "admin@test.mn" }));
    expect(noPassword.status).toBe(400);
    const notJson = await loginPOST(
      new Request("http://localhost/api/auth/login", { method: "POST", body: "nope" })
    );
    expect(notJson.status).toBe(400);
  });

  it("returns 500 on unexpected error", async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error("db error"));
    const res = await loginPOST(loginReq({ email: "a@a.mn", password: "p" }));
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
describe("POST /api/auth/logout", () => {
  it("returns 200 and clears the token cookie", async () => {
    const res = await logoutPOST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/logged out/i);
    // Cookie should be cleared (maxAge=0)
    expect(res.headers.get("set-cookie")).toContain("token=");
  });
});
