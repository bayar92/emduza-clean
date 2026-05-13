import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

// Must import after mocks
const { POST } = await import("@/app/api/upload/route");

function makeFile(name: string, type: string, size = 100): File {
  return new File([new Uint8Array(size)], name, { type });
}

function makeRequest(file: File | null): Request {
  const form = new FormData();
  if (file) form.append("file", file);
  return new Request("http://localhost/api/upload", {
    method: "POST",
    body: form,
  });
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/upload", () => {
  it("returns 201 and a url for a valid image", async () => {
    const req = makeRequest(makeFile("photo.jpg", "image/jpeg"));
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.url).toMatch(/^\/uploads\/editor\//);
  });

  it("returns 400 when no file is provided", async () => {
    const req = makeRequest(null);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("returns 400 for an empty file", async () => {
    const req = makeRequest(makeFile("empty.jpg", "image/jpeg", 0));
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for a disallowed file type", async () => {
    const req = makeRequest(makeFile("doc.pdf", "application/pdf", 100));
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/JPEG|PNG|WebP/);
  });

  it("returns 400 for an image exceeding 10 MB", async () => {
    const req = makeRequest(makeFile("big.jpg", "image/jpeg", 11 * 1024 * 1024));
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/10MB/);
  });

  it("returns 201 for a valid PNG", async () => {
    const req = makeRequest(makeFile("img.png", "image/png", 200));
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 201 for a valid WebP", async () => {
    const req = makeRequest(makeFile("img.webp", "image/webp", 200));
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 500 when file write fails", async () => {
    const { writeFile } = await import("fs/promises");
    (writeFile as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("disk full"));
    const req = makeRequest(makeFile("photo.jpg", "image/jpeg", 100));
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});
