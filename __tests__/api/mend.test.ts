import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

const mockPrisma = {
  mend: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};
vi.mock("@/utils/prisma", () => ({ prisma: mockPrisma }));

const { GET, POST, PUT } = await import("@/app/api/mend/route");

const DB_RECORD = { id: 1, name: "Bat", company: "<p>Hello</p>", image: "/uploads/img/tech/x.jpg" };

function makeFormData(fields: Record<string, string | File>): Request {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return new Request("http://localhost/api/mend", { method: "POST", body: form });
}

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
describe("GET /api/mend", () => {
  it("returns the first record", async () => {
    mockPrisma.mend.findFirst.mockResolvedValue(DB_RECORD);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Bat");
  });

  it("returns null when no record exists", async () => {
    mockPrisma.mend.findFirst.mockResolvedValue(null);
    const res = await GET();
    const body = await res.json();
    expect(body).toBeNull();
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.mend.findFirst.mockRejectedValue(new Error("db down"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------
describe("POST /api/mend", () => {
  it("creates a record without image and returns 201", async () => {
    mockPrisma.mend.create.mockResolvedValue({ id: 2, name: "Suren", company: "<p>x</p>", image: "" });
    const req = makeFormData({ name: "Suren", company: "<p>x</p>" });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Suren");
  });

  it("creates a record with a valid image and returns 201", async () => {
    mockPrisma.mend.create.mockResolvedValue({ id: 3, name: "A", company: "", image: "/uploads/img/tech/a.jpg" });
    const file = new File([new Uint8Array(100)], "a.jpg", { type: "image/jpeg" });
    const req = makeFormData({ name: "A", company: "", image: file });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 400 for invalid image type", async () => {
    const file = new File([new Uint8Array(100)], "doc.pdf", { type: "application/pdf" });
    const req = makeFormData({ name: "A", company: "", image: file });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockPrisma.mend.create).not.toHaveBeenCalled();
  });

  it("returns 400 for image exceeding 10 MB", async () => {
    const file = new File([new Uint8Array(11 * 1024 * 1024)], "big.jpg", { type: "image/jpeg" });
    const req = makeFormData({ name: "A", company: "", image: file });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// PUT
// ---------------------------------------------------------------------------
describe("PUT /api/mend", () => {
  it("updates fields and returns 200", async () => {
    mockPrisma.mend.findFirst.mockResolvedValue(DB_RECORD);
    mockPrisma.mend.update.mockResolvedValue({ ...DB_RECORD, name: "Updated" });
    const req = new Request("http://localhost/api/mend", {
      method: "PUT",
      body: (() => { const f = new FormData(); f.append("name", "Updated"); f.append("company", "<p>new</p>"); return f; })(),
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Updated");
  });

  it("returns 404 when no record exists", async () => {
    mockPrisma.mend.findFirst.mockResolvedValue(null);
    const req = new Request("http://localhost/api/mend", {
      method: "PUT",
      body: (() => { const f = new FormData(); f.append("name", "X"); f.append("company", ""); return f; })(),
    });
    const res = await PUT(req);
    expect(res.status).toBe(404);
  });

  it("replaces image when a new valid image is uploaded", async () => {
    mockPrisma.mend.findFirst.mockResolvedValue(DB_RECORD);
    mockPrisma.mend.update.mockResolvedValue({ ...DB_RECORD, image: "/uploads/img/tech/new.jpg" });
    const file = new File([new Uint8Array(200)], "new.jpg", { type: "image/jpeg" });
    const form = new FormData();
    form.append("name", "Bat");
    form.append("company", "<p>x</p>");
    form.append("image", file);
    const req = new Request("http://localhost/api/mend", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    // update should have been called with an image path
    const updateCall = mockPrisma.mend.update.mock.calls[0][0];
    expect(updateCall.data.image).toMatch(/\/uploads\//);
  });

  it("returns 400 for invalid image type on update", async () => {
    mockPrisma.mend.findFirst.mockResolvedValue(DB_RECORD);
    const file = new File([new Uint8Array(100)], "bad.bmp", { type: "image/bmp" });
    const form = new FormData();
    form.append("name", "Bat");
    form.append("company", "");
    form.append("image", file);
    const req = new Request("http://localhost/api/mend", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(400);
    expect(mockPrisma.mend.update).not.toHaveBeenCalled();
  });

  it("returns 500 when DB update throws", async () => {
    mockPrisma.mend.findFirst.mockResolvedValue(DB_RECORD);
    mockPrisma.mend.update.mockRejectedValue(new Error("db error"));
    const form = new FormData();
    form.append("name", "X");
    form.append("company", "");
    const req = new Request("http://localhost/api/mend", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(500);
  });
});

// POST 500
describe("POST /api/mend — 500 path", () => {
  it("returns 500 when DB create throws", async () => {
    mockPrisma.mend.create.mockRejectedValue(new Error("db error"));
    const req = makeFormData({ name: "X", company: "" });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
