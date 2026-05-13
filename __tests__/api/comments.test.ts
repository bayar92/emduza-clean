import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  comment: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};
vi.mock("@/utils/prisma", () => ({ prisma: mockPrisma }));

const { GET, POST } = await import("@/app/api/comments/route");
const { POST: likePOST } = await import("@/app/api/comments/[id]/like/route");
const { POST: dislikePOST } = await import(
  "@/app/api/comments/[id]/dislike/route"
);

const COMMENT = { id: 1, name: "Bat", content: "Сайхан байна", newsId: 10, likes: 0, dislikes: 0, createdAt: new Date() };

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// GET /api/comments
// ---------------------------------------------------------------------------
describe("GET /api/comments", () => {
  it("returns comments for a newsId", async () => {
    mockPrisma.comment.findMany.mockResolvedValue([COMMENT]);
    const req = new Request("http://localhost/api/comments?newsId=10");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Bat");
  });

  it("returns 400 when newsId is missing", async () => {
    const req = new Request("http://localhost/api/comments");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns empty array when no comments", async () => {
    mockPrisma.comment.findMany.mockResolvedValue([]);
    const req = new Request("http://localhost/api/comments?newsId=99");
    const res = await GET(req);
    const body = await res.json();
    expect(body).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// POST /api/comments
// ---------------------------------------------------------------------------
describe("POST /api/comments", () => {
  it("creates a comment and returns 201", async () => {
    mockPrisma.comment.create.mockResolvedValue(COMMENT);
    const req = new Request("http://localhost/api/comments", {
      method: "POST",
      body: JSON.stringify({ name: "Bat", content: "Сайхан байна", newsId: 10 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Bat");
  });

  it("returns 400 when name is missing", async () => {
    const req = new Request("http://localhost/api/comments", {
      method: "POST",
      body: JSON.stringify({ content: "x", newsId: 1 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when content is missing", async () => {
    const req = new Request("http://localhost/api/comments", {
      method: "POST",
      body: JSON.stringify({ name: "Bat", newsId: 1 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when newsId is missing", async () => {
    const req = new Request("http://localhost/api/comments", {
      method: "POST",
      body: JSON.stringify({ name: "Bat", content: "x" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/comments/[id]/like
// ---------------------------------------------------------------------------
describe("POST /api/comments/[id]/like", () => {
  it("increments likes and returns the updated comment", async () => {
    mockPrisma.comment.update.mockResolvedValue({ ...COMMENT, likes: 1 });
    const res = await likePOST(
      new Request("http://localhost"),
      { params: Promise.resolve({ id: "1" }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.likes).toBe(1);
    expect(mockPrisma.comment.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { likes: { increment: 1 } },
    });
  });
});

// ---------------------------------------------------------------------------
// POST /api/comments/[id]/dislike
// ---------------------------------------------------------------------------
describe("POST /api/comments/[id]/dislike", () => {
  it("increments dislikes and returns the updated comment", async () => {
    mockPrisma.comment.update.mockResolvedValue({ ...COMMENT, dislikes: 1 });
    const res = await dislikePOST(
      new Request("http://localhost"),
      { params: Promise.resolve({ id: "1" }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dislikes).toBe(1);
    expect(mockPrisma.comment.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { dislikes: { increment: 1 } },
    });
  });
});
