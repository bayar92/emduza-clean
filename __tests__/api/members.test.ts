import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

const mockPrisma = {
  members: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};
vi.mock("@/utils/prisma", () => ({ prisma: mockPrisma }));

const { GET, POST, PUT, DELETE } = await import("@/app/api/members/route");

const MEMBER = {
  id: 1,
  position: "Дарга",
  name: "Bat",
  education: "МУИС",
  company: "ТТГ",
  parlament: "1-р хурал",
  image: "/uploads/img/tech/m.jpg",
};

function memberForm(overrides: Record<string, string | File> = {}) {
  const fields = {
    position: "Дарга",
    name: "Bat",
    education: "МУИС",
    company: "ТТГ",
    parlament: "1-р хурал",
    ...overrides,
  };
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return form;
}

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
describe("GET /api/members", () => {
  it("returns list of members", async () => {
    mockPrisma.members.findMany.mockResolvedValue([MEMBER]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Bat");
  });

  it("returns empty array when no members exist", async () => {
    mockPrisma.members.findMany.mockResolvedValue([]);
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.members.findMany.mockRejectedValue(new Error("db error"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------
describe("POST /api/members", () => {
  it("creates a member with image and returns 201", async () => {
    mockPrisma.members.create.mockResolvedValue(MEMBER);
    const form = memberForm({
      image: new File([new Uint8Array(100)], "m.jpg", { type: "image/jpeg" }),
    });
    const req = new Request("http://localhost/api/members", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Bat");
  });

  it("returns 400 when image is missing", async () => {
    const form = memberForm();
    const req = new Request("http://localhost/api/members", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockPrisma.members.create).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid image MIME type", async () => {
    const form = memberForm({
      image: new File([new Uint8Array(100)], "doc.pdf", { type: "application/pdf" }),
    });
    const req = new Request("http://localhost/api/members", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.members.create.mockRejectedValue(new Error("db error"));
    const form = memberForm({
      image: new File([new Uint8Array(100)], "m.jpg", { type: "image/jpeg" }),
    });
    const req = new Request("http://localhost/api/members", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// PUT
// ---------------------------------------------------------------------------
describe("PUT /api/members", () => {
  it("updates a member without new image", async () => {
    mockPrisma.members.findUnique.mockResolvedValue(MEMBER);
    mockPrisma.members.update.mockResolvedValue({ ...MEMBER, name: "Suren" });
    const form = memberForm({ name: "Suren" });
    const req = new Request("http://localhost/api/members?id=1", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Suren");
  });

  it("updates a member with new image", async () => {
    mockPrisma.members.findUnique.mockResolvedValue(MEMBER);
    mockPrisma.members.update.mockResolvedValue({ ...MEMBER, image: "/uploads/img/tech/new.jpg" });
    const form = memberForm({
      image: new File([new Uint8Array(200)], "new.jpg", { type: "image/jpeg" }),
    });
    const req = new Request("http://localhost/api/members?id=1", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const updateArg = mockPrisma.members.update.mock.calls[0][0];
    expect(updateArg.data.image).toMatch(/\/uploads\//);
  });

  it("returns 404 when member not found", async () => {
    mockPrisma.members.findUnique.mockResolvedValue(null);
    const form = memberForm();
    const req = new Request("http://localhost/api/members?id=99", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid image on update", async () => {
    mockPrisma.members.findUnique.mockResolvedValue(MEMBER);
    const form = memberForm({
      image: new File([new Uint8Array(100)], "x.bmp", { type: "image/bmp" }),
    });
    const req = new Request("http://localhost/api/members?id=1", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(400);
    expect(mockPrisma.members.update).not.toHaveBeenCalled();
  });

  it("returns 500 on DB update error", async () => {
    mockPrisma.members.findUnique.mockResolvedValue(MEMBER);
    mockPrisma.members.update.mockRejectedValue(new Error("db error"));
    const form = memberForm();
    const req = new Request("http://localhost/api/members?id=1", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
describe("DELETE /api/members", () => {
  it("deletes a member and returns 204", async () => {
    mockPrisma.members.delete.mockResolvedValue(MEMBER);
    const req = new Request("http://localhost/api/members?id=1", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(204);
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.members.delete.mockRejectedValue(new Error("db error"));
    const req = new Request("http://localhost/api/members?id=1", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(500);
  });
});
