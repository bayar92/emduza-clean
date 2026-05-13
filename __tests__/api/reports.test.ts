import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

const mockPrisma = {
  $executeRawUnsafe: vi.fn().mockResolvedValue(undefined),
  $queryRawUnsafe: vi.fn(),
};
vi.mock("@/utils/prisma", () => ({ prisma: mockPrisma }));

const { GET, POST, DELETE } = await import("@/app/api/reports/route");

const REPORT = { id: 1, title: "2024 он", filename: "report.pdf", year: 2024, type: "annual", createdAt: new Date(), updatedAt: new Date() };

beforeEach(() => {
  vi.clearAllMocks();
  // ensureTable always succeeds
  mockPrisma.$executeRawUnsafe.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
describe("GET /api/reports", () => {
  it("returns all reports", async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([REPORT]);
    const req = new Request("http://localhost/api/reports");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("2024 он");
  });

  it("filters by type when provided", async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([REPORT]);
    const req = new Request("http://localhost/api/reports?type=annual");
    await GET(req);
    expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("WHERE type"),
      "annual"
    );
  });

  it("returns all without filter when type is absent", async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([REPORT]);
    const req = new Request("http://localhost/api/reports");
    await GET(req);
    // Called with query that has no WHERE
    const call = mockPrisma.$queryRawUnsafe.mock.calls[0];
    expect(call[0]).not.toContain("WHERE");
  });
});

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------
describe("POST /api/reports", () => {
  it("creates a report without file and returns 201", async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([REPORT]);
    const form = new FormData();
    form.append("title", "2024 он");
    form.append("year", "2024");
    form.append("type", "annual");
    const req = new Request("http://localhost/api/reports", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("creates a report with file", async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([REPORT]);
    const form = new FormData();
    form.append("title", "2024 он");
    form.append("year", "2024");
    form.append("type", "annual");
    form.append("file", new File([new Uint8Array(100)], "r.pdf", { type: "application/pdf" }));
    const req = new Request("http://localhost/api/reports", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 400 when required fields are missing", async () => {
    const form = new FormData();
    form.append("title", "only title");
    const req = new Request("http://localhost/api/reports", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------
describe("DELETE /api/reports", () => {
  it("deletes report without file and returns 204", async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ filename: null }]);
    const req = new Request("http://localhost/api/reports?id=1", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(204);
    expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM"),
      1
    );
  });

  it("deletes file from disk when filename exists", async () => {
    const { unlink } = await import("fs/promises");
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ filename: "report.pdf" }]);
    const req = new Request("http://localhost/api/reports?id=1", { method: "DELETE" });
    await DELETE(req);
    expect(unlink).toHaveBeenCalledWith(expect.stringContaining("report.pdf"));
  });
});
