import { describe, it, expect, vi, beforeEach } from "vitest";

const mockIntro = {
  introduction: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
};
vi.mock("@/utils/prisma", () => ({ prisma: mockIntro }));

const { GET, POST, PUT } = await import("@/app/api/introduction/route");

const RECORD = { id: 1, content: "<p>Танилцуулга</p>" };

beforeEach(() => vi.clearAllMocks());

describe("GET /api/introduction", () => {
  it("returns the first record", async () => {
    mockIntro.introduction.findFirst.mockResolvedValue(RECORD);
    const res = await GET();
    expect(res.status).toBe(200);
    expect((await res.json()).content).toBe("<p>Танилцуулга</p>");
  });

  it("returns null when empty", async () => {
    mockIntro.introduction.findFirst.mockResolvedValue(null);
    expect(await (await GET()).json()).toBeNull();
  });

  it("returns 500 on DB error", async () => {
    mockIntro.introduction.findFirst.mockRejectedValue(new Error("db error"));
    expect((await GET()).status).toBe(500);
  });
});

describe("POST /api/introduction", () => {
  it("creates content and returns 201", async () => {
    mockIntro.introduction.create.mockResolvedValue(RECORD);
    const req = new Request("http://localhost/api/introduction", {
      method: "POST",
      body: JSON.stringify({ content: "<p>Танилцуулга</p>" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(201);
  });

  it("returns 500 on DB error", async () => {
    mockIntro.introduction.create.mockRejectedValue(new Error("db error"));
    const req = new Request("http://localhost/api/introduction", {
      method: "POST",
      body: JSON.stringify({ content: "x" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await POST(req)).status).toBe(500);
  });
});

describe("PUT /api/introduction", () => {
  it("updates when record exists", async () => {
    mockIntro.introduction.findFirst.mockResolvedValue(RECORD);
    mockIntro.introduction.update.mockResolvedValue({ ...RECORD, content: "<p>New</p>" });
    const req = new Request("http://localhost/api/introduction", {
      method: "PUT",
      body: JSON.stringify({ content: "<p>New</p>" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
  });

  it("creates when no record exists", async () => {
    mockIntro.introduction.findFirst.mockResolvedValue(null);
    mockIntro.introduction.create.mockResolvedValue(RECORD);
    const req = new Request("http://localhost/api/introduction", {
      method: "PUT",
      body: JSON.stringify({ content: "<p>x</p>" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PUT(req)).status).toBe(201);
  });

  it("returns 500 on DB error", async () => {
    mockIntro.introduction.findFirst.mockRejectedValue(new Error("db error"));
    const req = new Request("http://localhost/api/introduction", {
      method: "PUT",
      body: JSON.stringify({ content: "x" }),
      headers: { "Content-Type": "application/json" },
    });
    expect((await PUT(req)).status).toBe(500);
  });
});
