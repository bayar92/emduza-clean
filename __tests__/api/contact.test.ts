import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  contactInfo: { findUnique: vi.fn(), upsert: vi.fn() },
};
vi.mock("@/utils/prisma", () => ({ prisma: mockPrisma }));

let cookieToken: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "token" && cookieToken ? { value: cookieToken } : undefined,
  }),
}));

const isTokenValid = vi.fn();
vi.mock("@/utils/auth", () => ({ isTokenValid: (t: string) => isTokenValid(t) }));

import { revalidatePath } from "next/cache";
import { DEFAULT_CONTACT } from "@/utils/contact";

const { GET, PUT } = await import("@/app/api/contact/route");

const BODY = {
  address: "Хан-Уул дүүрэг",
  phone: "77135051",
  email: "emduz@gov.mn",
  socialName: "ЭМДҮЗ",
  socialUrl: "https://www.facebook.com/emduz",
};

function put(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/contact", {
    method: "PUT",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  cookieToken = "good-token";
  isTokenValid.mockImplementation((t: string) => t === "good-token");
});

describe("GET /api/contact", () => {
  it("returns the saved row", async () => {
    mockPrisma.contactInfo.findUnique.mockResolvedValue({ id: 1, ...BODY, updatedAt: new Date() });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(BODY);
  });

  it("returns the built-in defaults before anything is saved", async () => {
    mockPrisma.contactInfo.findUnique.mockResolvedValue(null);
    expect(await (await GET()).json()).toEqual(DEFAULT_CONTACT);
  });

  it("still answers with defaults when the database/table is unavailable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockPrisma.contactInfo.findUnique.mockRejectedValue(new Error("relation does not exist"));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(DEFAULT_CONTACT);
  });
});

describe("PUT /api/contact", () => {
  it("rejects requests without a valid token", async () => {
    cookieToken = undefined;
    expect((await PUT(put(BODY))).status).toBe(401);

    cookieToken = "forged";
    expect((await PUT(put(BODY))).status).toBe(401);
    expect(mockPrisma.contactInfo.upsert).not.toHaveBeenCalled();
  });

  it("accepts a valid Bearer token too", async () => {
    cookieToken = undefined;
    mockPrisma.contactInfo.upsert.mockResolvedValue({ id: 1, ...BODY });
    const res = await PUT(put(BODY, { Authorization: "Bearer good-token" }));
    expect(res.status).toBe(200);
  });

  it("returns 400 and writes nothing for invalid input", async () => {
    const res = await PUT(put({ ...BODY, email: "nope" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBeTruthy();
    expect((await PUT(put({ ...BODY, socialUrl: "javascript:alert(1)" }))).status).toBe(400);
    expect((await PUT(put("not json"))).status).toBe(400);
    expect(mockPrisma.contactInfo.upsert).not.toHaveBeenCalled();
  });

  it("upserts the single row (id 1), trims, and revalidates the site", async () => {
    mockPrisma.contactInfo.upsert.mockResolvedValue({ id: 1, ...BODY });
    const res = await PUT(put({ ...BODY, address: "  Хан-Уул дүүрэг  " }));
    expect(res.status).toBe(200);
    expect(mockPrisma.contactInfo.upsert).toHaveBeenCalledWith({
      where: { id: 1 },
      create: { id: 1, ...BODY },
      update: BODY,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(await res.json()).toEqual(BODY);
  });

  it("returns 500 when saving fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockPrisma.contactInfo.upsert.mockRejectedValue(new Error("db down"));
    expect((await PUT(put(BODY))).status).toBe(500);
  });
});
