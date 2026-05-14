import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

const mockPrisma = {
  report: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
};
vi.mock("@/utils/prisma", () => ({ prisma: mockPrisma }));

const { GET, POST, DELETE } = await import("@/app/api/reports/route");

const REPORT = {
  id: 1,
  title: "2024 он",
  filename: "report.pdf",
  year: 2024,
  type: "annual",
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------
describe("GET /api/reports", () => {
  it("returns all reports", async () => {
    mockPrisma.report.findMany.mockResolvedValue([REPORT]);
    const req = new Request("http://localhost/api/reports");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe("2024 он");
  });

  it("filters by type when provided", async () => {
    mockPrisma.report.findMany.mockResolvedValue([REPORT]);
    const req = new Request("http://localhost/api/reports?type=annual");
    await GET(req);
    expect(mockPrisma.report.findMany).toHaveBeenCalledWith({
      where: { type: "annual" },
      orderBy: { year: "desc" },
    });
  });

  it("returns all without filter when type is absent", async () => {
    mockPrisma.report.findMany.mockResolvedValue([REPORT]);
    const req = new Request("http://localhost/api/reports");
    await GET(req);
    expect(mockPrisma.report.findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: { year: "desc" },
    });
  });
});

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------
describe("POST /api/reports", () => {
  it("creates a report without file and returns 201", async () => {
    mockPrisma.report.create.mockResolvedValue(REPORT);
    const form = new FormData();
    form.append("title", "2024 он");
    form.append("year", "2024");
    form.append("type", "annual");
    const req = new Request("http://localhost/api/reports", { method: "POST", body: form });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("creates a report with file", async () => {
    mockPrisma.report.create.mockResolvedValue(REPORT);
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
    mockPrisma.report.findUnique.mockResolvedValue({ filename: null });
    mockPrisma.report.delete.mockResolvedValue(REPORT);
    const req = new Request("http://localhost/api/reports?id=1", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(204);
    expect(mockPrisma.report.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it("deletes file from disk when filename exists", async () => {
    const { unlink } = await import("fs/promises");
    mockPrisma.report.findUnique.mockResolvedValue({ filename: "report.pdf" });
    mockPrisma.report.delete.mockResolvedValue(REPORT);
    const req = new Request("http://localhost/api/reports?id=1", { method: "DELETE" });
    await DELETE(req);
    expect(unlink).toHaveBeenCalledWith(expect.stringContaining("report.pdf"));
  });
});
