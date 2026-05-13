import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

const mockPrisma = {
  stCommittee: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};
vi.mock("@/utils/prisma", () => ({ prisma: mockPrisma }));

const { GET, POST, PUT, DELETE } = await import(
  "@/app/api/standingCommittee/route"
);

const ITEM = {
  id: 1,
  text: "Тогтоол",
  category: "Боловсрол",
  filename: null,
  Date: new Date("2024-06-15"),
  day: 15,
  month: 6,
  number: 42,
  createdAt: new Date(),
};

function baseForm(overrides: Record<string, string | File> = {}) {
  const f = new FormData();
  f.append("text", "Тогтоол");
  f.append("category", "Боловсрол");
  f.append("date", "2024-06-15");
  f.append("number", "42");
  for (const [k, v] of Object.entries(overrides)) f.append(k, v);
  return f;
}

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
describe("GET /api/standingCommittee", () => {
  it("returns paginated list", async () => {
    mockPrisma.stCommittee.findMany.mockResolvedValue([ITEM]);
    mockPrisma.stCommittee.count.mockResolvedValue(1);
    const req = new Request("http://localhost/api/standingCommittee?page=1&limit=10");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.stcommittee).toHaveLength(1);
    expect(body.currentCommittee).toBe(1);
  });

  it("uses default sort createdAt desc", async () => {
    mockPrisma.stCommittee.findMany.mockResolvedValue([]);
    mockPrisma.stCommittee.count.mockResolvedValue(0);
    const req = new Request("http://localhost/api/standingCommittee");
    await GET(req);
    expect(mockPrisma.stCommittee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: "desc" } })
    );
  });

  it("accepts sortBy=text and sortOrder=asc", async () => {
    mockPrisma.stCommittee.findMany.mockResolvedValue([]);
    mockPrisma.stCommittee.count.mockResolvedValue(0);
    const req = new Request(
      "http://localhost/api/standingCommittee?sortBy=text&sortOrder=asc"
    );
    await GET(req);
    expect(mockPrisma.stCommittee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { text: "asc" } })
    );
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.stCommittee.findMany.mockRejectedValue(new Error("db error"));
    const req = new Request("http://localhost/api/standingCommittee");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------
describe("POST /api/standingCommittee", () => {
  it("creates an item without file and returns 201", async () => {
    mockPrisma.stCommittee.create.mockResolvedValue(ITEM);
    const req = new Request("http://localhost/api/standingCommittee", {
      method: "POST",
      body: baseForm(),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("creates an item with a PDF file", async () => {
    mockPrisma.stCommittee.create.mockResolvedValue({ ...ITEM, filename: "doc.pdf" });
    const form = baseForm({
      file: new File([new Uint8Array(100)], "doc.pdf", { type: "application/pdf" }),
    });
    const req = new Request("http://localhost/api/standingCommittee", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 400 for disallowed file type", async () => {
    const form = baseForm({
      file: new File([new Uint8Array(100)], "img.jpg", { type: "image/jpeg" }),
    });
    const req = new Request("http://localhost/api/standingCommittee", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/PDF|Word|Excel/);
  });

  it("returns 400 when required fields are missing", async () => {
    const form = new FormData();
    form.append("text", "only text");
    const req = new Request("http://localhost/api/standingCommittee", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.stCommittee.create.mockRejectedValue(new Error("db error"));
    const req = new Request("http://localhost/api/standingCommittee", {
      method: "POST",
      body: baseForm(),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// PUT
// ---------------------------------------------------------------------------
describe("PUT /api/standingCommittee", () => {
  it("updates text and category", async () => {
    mockPrisma.stCommittee.update.mockResolvedValue({ ...ITEM, text: "Шинэ тогтоол" });
    const form = new FormData();
    form.append("text", "Шинэ тогтоол");
    form.append("category", "Эрүүл мэнд");
    const req = new Request("http://localhost/api/standingCommittee?id=1", {
      method: "PUT",
      body: form,
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    expect((await res.json()).text).toBe("Шинэ тогтоол");
  });

  it("returns 400 when id is missing", async () => {
    const form = new FormData();
    form.append("text", "X");
    form.append("category", "Y");
    const req = new Request("http://localhost/api/standingCommittee", {
      method: "PUT",
      body: form,
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.stCommittee.update.mockRejectedValue(new Error("db error"));
    const form = new FormData();
    form.append("text", "X");
    form.append("category", "Y");
    const req = new Request("http://localhost/api/standingCommittee?id=1", {
      method: "PUT",
      body: form,
    });
    const res = await PUT(req);
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
describe("DELETE /api/standingCommittee", () => {
  it("deletes an item and returns 204", async () => {
    mockPrisma.stCommittee.delete.mockResolvedValue(ITEM);
    const req = new Request("http://localhost/api/standingCommittee?id=1", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    expect(res.status).toBe(204);
  });

  it("returns 400 when id is missing", async () => {
    const req = new Request("http://localhost/api/standingCommittee", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.stCommittee.delete.mockRejectedValue(new Error("db error"));
    const req = new Request("http://localhost/api/standingCommittee?id=1", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    expect(res.status).toBe(500);
  });
});
