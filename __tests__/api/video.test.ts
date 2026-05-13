import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

// Sync fs (existsSync / unlinkSync) used by video DELETE
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
    unlinkSync: vi.fn(),
  },
}));

const mockPrisma = {
  video: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};
vi.mock("@/utils/prisma", () => ({ prisma: mockPrisma }));

const { GET, POST, DELETE } = await import("@/app/api/video/route");

const VIDEO = {
  id: 1,
  title: "Test video",
  videoPath: "/uploads/video/v.mp4",
  createdAt: new Date(),
};

function videoFile(size = 1024) {
  return new File([new Uint8Array(size)], "clip.mp4", { type: "video/mp4" });
}

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
describe("GET /api/video", () => {
  it("returns paginated videos", async () => {
    mockPrisma.video.findMany.mockResolvedValue([VIDEO]);
    mockPrisma.video.count.mockResolvedValue(1);
    const req = new Request("http://localhost/api/video?page=1&limit=10");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.videos).toHaveLength(1);
    expect(body.totalVideos).toBe(1);
  });

  it("uses default page=1 and limit=10", async () => {
    mockPrisma.video.findMany.mockResolvedValue([]);
    mockPrisma.video.count.mockResolvedValue(0);
    const req = new Request("http://localhost/api/video");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(mockPrisma.video.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 })
    );
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.video.findMany.mockRejectedValue(new Error("db error"));
    const req = new Request("http://localhost/api/video");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------
describe("POST /api/video", () => {
  it("creates a video and returns 201", async () => {
    mockPrisma.video.create.mockResolvedValue(VIDEO);
    const form = new FormData();
    form.append("title", "Test video");
    form.append("video", videoFile());
    const req = new Request("http://localhost/api/video", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.title).toBe("Test video");
  });

  it("returns 400 when title is missing", async () => {
    const form = new FormData();
    form.append("video", videoFile());
    const req = new Request("http://localhost/api/video", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockPrisma.video.create).not.toHaveBeenCalled();
  });

  it("returns 400 when video file is missing", async () => {
    const form = new FormData();
    form.append("title", "Test");
    const req = new Request("http://localhost/api/video", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid video MIME type", async () => {
    const form = new FormData();
    form.append("title", "Test");
    form.append("video", new File([new Uint8Array(100)], "v.avi", { type: "video/x-msvideo" }));
    const req = new Request("http://localhost/api/video", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.video.create.mockRejectedValue(new Error("db error"));
    const form = new FormData();
    form.append("title", "T");
    form.append("video", videoFile());
    const req = new Request("http://localhost/api/video", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
describe("DELETE /api/video", () => {
  it("deletes a video and returns 204", async () => {
    mockPrisma.video.findUnique.mockResolvedValue(VIDEO);
    mockPrisma.video.delete.mockResolvedValue(VIDEO);
    const req = new Request("http://localhost/api/video?id=1", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(204);
  });

  it("returns 400 when id is missing", async () => {
    const req = new Request("http://localhost/api/video", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when video not found", async () => {
    mockPrisma.video.findUnique.mockResolvedValue(null);
    const req = new Request("http://localhost/api/video?id=99", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(404);
  });

  it("deletes the file from disk when it exists", async () => {
    const fs = await import("fs");
    (fs.default.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    mockPrisma.video.findUnique.mockResolvedValue(VIDEO);
    mockPrisma.video.delete.mockResolvedValue(VIDEO);
    const req = new Request("http://localhost/api/video?id=1", { method: "DELETE" });
    await DELETE(req);
    expect(fs.default.unlinkSync).toHaveBeenCalled();
  });

  it("returns 500 on DB error", async () => {
    mockPrisma.video.findUnique.mockResolvedValue(VIDEO);
    mockPrisma.video.delete.mockRejectedValue(new Error("db error"));
    const req = new Request("http://localhost/api/video?id=1", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(500);
  });
});
