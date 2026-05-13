import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

const mockPrisma = {
  news: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};
vi.mock("@/utils/prisma", () => ({ prisma: mockPrisma }));

const { GET, POST, PUT, DELETE } = await import("@/app/api/news/route");

const NEWS = {
  id: 1,
  title: "Test news",
  category: "politics",
  content: "<p>content</p>",
  coverImage: "/uploads/news/cover.jpg",
  images: ["/uploads/news/img1.jpg"],
  slug: "test-slug",
  date: new Date("2024-01-01"),
  createdAt: new Date(),
};

function img(name = "photo.jpg", type = "image/jpeg", size = 100) {
  return new File([new Uint8Array(size)], name, { type });
}

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
describe("GET /api/news", () => {
  it("returns all news items", async () => {
    mockPrisma.news.findMany.mockResolvedValue([NEWS]);
    const req = new Request("http://localhost/api/news");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
  });

  it("returns single item by slug", async () => {
    mockPrisma.news.findUnique.mockResolvedValue(NEWS);
    const req = new Request("http://localhost/api/news?slug=test-slug");
    const res = await GET(req);
    const body = await res.json();
    expect(body.title).toBe("Test news");
    expect(mockPrisma.news.findUnique).toHaveBeenCalledWith({ where: { slug: "test-slug" } });
  });
});

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------
describe("POST /api/news", () => {
  it("creates news without images and returns 201", async () => {
    mockPrisma.news.create.mockResolvedValue(NEWS);
    const form = new FormData();
    form.append("title", "Test news");
    form.append("category", "politics");
    form.append("content", "<p>content</p>");
    const req = new Request("http://localhost/api/news", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("creates news with coverImage and gallery images", async () => {
    mockPrisma.news.create.mockResolvedValue(NEWS);
    const form = new FormData();
    form.append("title", "T");
    form.append("category", "C");
    form.append("content", "X");
    form.append("coverImage", img());
    form.append("images", img("a.jpg"));
    form.append("images", img("b.png", "image/png"));
    const req = new Request("http://localhost/api/news", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const createArg = mockPrisma.news.create.mock.calls[0][0].data;
    expect(createArg.coverImage).toMatch(/\/uploads\//);
    expect(createArg.images).toHaveLength(2);
  });

  it("returns 400 for missing required fields", async () => {
    const form = new FormData();
    form.append("title", "Only title");
    const req = new Request("http://localhost/api/news", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockPrisma.news.create).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid coverImage type", async () => {
    const form = new FormData();
    form.append("title", "T");
    form.append("category", "C");
    form.append("content", "X");
    form.append("coverImage", img("x.pdf", "application/pdf"));
    const req = new Request("http://localhost/api/news", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid gallery image type", async () => {
    const form = new FormData();
    form.append("title", "T");
    form.append("category", "C");
    form.append("content", "X");
    form.append("images", img("x.bmp", "image/bmp"));
    const req = new Request("http://localhost/api/news", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.news.create.mockRejectedValue(new Error("db error"));
    const form = new FormData();
    form.append("title", "T");
    form.append("category", "C");
    form.append("content", "X");
    const req = new Request("http://localhost/api/news", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// PUT
// ---------------------------------------------------------------------------
describe("PUT /api/news", () => {
  it("updates a news item", async () => {
    mockPrisma.news.findUnique.mockResolvedValue(NEWS);
    mockPrisma.news.update.mockResolvedValue({ ...NEWS, title: "Updated" });
    const form = new FormData();
    form.append("id", "1");
    form.append("title", "Updated");
    form.append("category", "C");
    form.append("content", "X");
    const req = new Request("http://localhost/api/news", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("Updated");
  });

  it("returns 400 when id is missing", async () => {
    const form = new FormData();
    form.append("title", "T");
    const req = new Request("http://localhost/api/news", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when news not found", async () => {
    mockPrisma.news.findUnique.mockResolvedValue(null);
    const form = new FormData();
    form.append("id", "99");
    form.append("title", "T");
    form.append("category", "C");
    form.append("content", "X");
    const req = new Request("http://localhost/api/news", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(404);
  });

  it("deletes specified images and adds new ones", async () => {
    mockPrisma.news.findUnique.mockResolvedValue(NEWS);
    mockPrisma.news.update.mockResolvedValue(NEWS);
    const form = new FormData();
    form.append("id", "1");
    form.append("title", "T");
    form.append("category", "C");
    form.append("content", "X");
    form.append("deleteImages", "/uploads/news/img1.jpg");
    form.append("images", img("new.jpg"));
    const req = new Request("http://localhost/api/news", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const updateArg = mockPrisma.news.update.mock.calls[0][0].data;
    // old image removed, new one added
    expect(updateArg.images).not.toContain("/uploads/news/img1.jpg");
    expect(updateArg.images.some((p: string) => p.includes("/uploads/"))).toBe(true);
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.news.findUnique.mockResolvedValue(NEWS);
    mockPrisma.news.update.mockRejectedValue(new Error("db error"));
    const form = new FormData();
    form.append("id", "1");
    form.append("title", "T");
    form.append("category", "C");
    form.append("content", "X");
    const req = new Request("http://localhost/api/news", { method: "PUT", body: form });
    const res = await PUT(req);
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
describe("DELETE /api/news", () => {
  it("deletes a news item and returns 204", async () => {
    mockPrisma.news.delete.mockResolvedValue(NEWS);
    const req = new Request("http://localhost/api/news?id=1", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(204);
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.news.delete.mockRejectedValue(new Error("db error"));
    const req = new Request("http://localhost/api/news?id=1", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(500);
  });
});
