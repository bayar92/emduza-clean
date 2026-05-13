import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- aaIntroduction -------------------------------------------------------
const mockAA = {
  aaIntroduction: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
};
vi.mock("@/utils/prisma", () => ({ prisma: mockAA }));

const {
  GET: aaGET,
  POST: aaPOST,
  PUT: aaPUT,
} = await import("@/app/api/aaIntroduction/route");

// ---- introduction (shares same prisma mock, so import after) ---------------
// Re-import with a different prisma mock via a second module
// We test introduction separately using its own mock shape.

const RECORD = { id: 1, content: "<p>Hello</p>" };

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// aaIntroduction
// ---------------------------------------------------------------------------
describe("GET /api/aaIntroduction", () => {
  it("returns the first record", async () => {
    mockAA.aaIntroduction.findFirst.mockResolvedValue(RECORD);
    const res = await aaGET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.content).toBe("<p>Hello</p>");
  });

  it("returns null when empty", async () => {
    mockAA.aaIntroduction.findFirst.mockResolvedValue(null);
    const res = await aaGET();
    const body = await res.json();
    expect(body).toBeNull();
  });

  it("returns 500 on DB error", async () => {
    mockAA.aaIntroduction.findFirst.mockRejectedValue(new Error("db error"));
    const res = await aaGET();
    expect(res.status).toBe(500);
  });
});

describe("POST /api/aaIntroduction", () => {
  it("creates content and returns 201", async () => {
    mockAA.aaIntroduction.create.mockResolvedValue(RECORD);
    const req = new Request("http://localhost/api/aaIntroduction", {
      method: "POST",
      body: JSON.stringify({ content: "<p>Hello</p>" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await aaPOST(req);
    expect(res.status).toBe(201);
  });

  it("returns 500 on DB error", async () => {
    mockAA.aaIntroduction.create.mockRejectedValue(new Error("db error"));
    const req = new Request("http://localhost/api/aaIntroduction", {
      method: "POST",
      body: JSON.stringify({ content: "x" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await aaPOST(req);
    expect(res.status).toBe(500);
  });
});

describe("PUT /api/aaIntroduction", () => {
  it("updates when record exists", async () => {
    mockAA.aaIntroduction.findFirst.mockResolvedValue(RECORD);
    mockAA.aaIntroduction.update.mockResolvedValue({ ...RECORD, content: "<p>New</p>" });
    const req = new Request("http://localhost/api/aaIntroduction", {
      method: "PUT",
      body: JSON.stringify({ content: "<p>New</p>" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await aaPUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.content).toBe("<p>New</p>");
  });

  it("creates when no record exists (upsert path)", async () => {
    mockAA.aaIntroduction.findFirst.mockResolvedValue(null);
    mockAA.aaIntroduction.create.mockResolvedValue(RECORD);
    const req = new Request("http://localhost/api/aaIntroduction", {
      method: "PUT",
      body: JSON.stringify({ content: "<p>Hello</p>" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await aaPUT(req);
    expect(res.status).toBe(201);
  });

  it("returns 500 on DB error", async () => {
    mockAA.aaIntroduction.findFirst.mockRejectedValue(new Error("db error"));
    const req = new Request("http://localhost/api/aaIntroduction", {
      method: "PUT",
      body: JSON.stringify({ content: "x" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await aaPUT(req);
    expect(res.status).toBe(500);
  });
});
