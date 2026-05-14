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

  it("returns 429 after exceeding rate limit from same IP", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const ip = "10.0.0.99";
    // Use up 5 attempts
    for (let i = 0; i < 5; i++) {
      await loginPOST(loginReq({ email: "x@x.mn", password: "p" }, ip));
    }
    const res = await loginPOST(loginReq({ email: "x@x.mn", password: "p" }, ip));
    expect(res.status).toBe(429);
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
