import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  menuPage: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};
vi.mock("@/utils/prisma", () => ({ prisma: mockPrisma }));

let cookieToken: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "token" && cookieToken ? { value: cookieToken } : undefined,
  }),
}));
vi.mock("@/utils/auth", () => ({ isTokenValid: (t: string) => t === "good-token" }));

import { revalidatePath } from "next/cache";

const { GET, POST } = await import("@/app/api/menuPages/route");
const { GET: GET_ONE, PUT, DELETE } = await import("@/app/api/menuPages/[id]/route");

const BODY = {
  title: "Хөгжлийн бодлого",
  slug: "hugjliin-bodlogo",
  parent: "about",
  content: "<p>Сайн</p><script>alert(1)</script>",
  sortOrder: 2,
  published: true,
};

const json = (method: string, body?: unknown, url = "http://localhost/api/menuPages") =>
  new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.clearAllMocks();
  cookieToken = "good-token";
});

describe("GET /api/menuPages", () => {
  it("is public and returns only published entries (no content)", async () => {
    mockPrisma.menuPage.findMany.mockResolvedValue([{ id: 1, title: "A", slug: "a", parent: "", sortOrder: 0 }]);
    cookieToken = undefined;
    const res = await GET(json("GET"));
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
    expect(mockPrisma.menuPage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { published: true },
        select: expect.not.objectContaining({ content: true }),
      })
    );
  });

  it("degrades to an empty list when the table/database is unavailable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockPrisma.menuPage.findMany.mockRejectedValue(new Error("relation does not exist"));
    const res = await GET(json("GET"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("?all=1 requires an admin", async () => {
    cookieToken = undefined;
    const res = await GET(json("GET", undefined, "http://localhost/api/menuPages?all=1"));
    expect(res.status).toBe(401);
    expect(mockPrisma.menuPage.findMany).not.toHaveBeenCalled();
  });

  it("?all=1 returns drafts for an admin", async () => {
    mockPrisma.menuPage.findMany.mockResolvedValue([{ id: 2, published: false }]);
    const res = await GET(json("GET", undefined, "http://localhost/api/menuPages?all=1"));
    expect(res.status).toBe(200);
    const args = mockPrisma.menuPage.findMany.mock.calls[0][0];
    expect(args.where).toBeUndefined();
  });
});

describe("POST /api/menuPages", () => {
  it("rejects non-admins", async () => {
    cookieToken = "forged";
    expect((await POST(json("POST", BODY))).status).toBe(401);
    expect(mockPrisma.menuPage.create).not.toHaveBeenCalled();
  });

  it("validates input", async () => {
    expect((await POST(json("POST", { ...BODY, slug: "Bad Slug" }))).status).toBe(400);
    expect((await POST(json("POST", "not json"))).status).toBe(400);
    expect(mockPrisma.menuPage.create).not.toHaveBeenCalled();
  });

  it("creates the page with sanitized content and refreshes the site", async () => {
    mockPrisma.menuPage.create.mockImplementation(async ({ data }) => ({ id: 7, ...data }));
    const res = await POST(json("POST", BODY));
    expect(res.status).toBe(201);
    const data = mockPrisma.menuPage.create.mock.calls[0][0].data;
    expect(data.slug).toBe("hugjliin-bodlogo");
    expect(data.content).toBe("<p>Сайн</p>");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("returns 409 when the slug is already taken", async () => {
    mockPrisma.menuPage.create.mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));
    const res = await POST(json("POST", BODY));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/хаяг/i);
  });

  it("returns 500 on unexpected errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockPrisma.menuPage.create.mockRejectedValue(new Error("db down"));
    expect((await POST(json("POST", BODY))).status).toBe(500);
  });
});

describe("/api/menuPages/[id]", () => {
  it("GET: admin only, 404 for unknown or malformed ids", async () => {
    cookieToken = undefined;
    expect((await GET_ONE(json("GET"), ctx("1"))).status).toBe(401);

    cookieToken = "good-token";
    mockPrisma.menuPage.findUnique.mockResolvedValue(null);
    expect((await GET_ONE(json("GET"), ctx("1"))).status).toBe(404);
    expect((await GET_ONE(json("GET"), ctx("abc"))).status).toBe(404);
    expect((await GET_ONE(json("GET"), ctx("-3"))).status).toBe(404);
  });

  it("GET: returns the full record including a draft's content", async () => {
    mockPrisma.menuPage.findUnique.mockResolvedValue({ id: 1, ...BODY, published: false });
    const res = await GET_ONE(json("GET"), ctx("1"));
    expect(res.status).toBe(200);
    expect((await res.json()).content).toContain("Сайн");
  });

  it("PUT: updates with sanitized content", async () => {
    mockPrisma.menuPage.update.mockImplementation(async ({ data }) => ({ id: 5, ...data }));
    const res = await PUT(json("PUT", BODY), ctx("5"));
    expect(res.status).toBe(200);
    const args = mockPrisma.menuPage.update.mock.calls[0][0];
    expect(args.where).toEqual({ id: 5 });
    expect(args.data.content).toBe("<p>Сайн</p>");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("PUT: 401 / 400 / 404 / 409 paths", async () => {
    cookieToken = undefined;
    expect((await PUT(json("PUT", BODY), ctx("5"))).status).toBe(401);

    cookieToken = "good-token";
    expect((await PUT(json("PUT", { ...BODY, title: "" }), ctx("5"))).status).toBe(400);

    mockPrisma.menuPage.update.mockRejectedValueOnce(Object.assign(new Error("gone"), { code: "P2025" }));
    expect((await PUT(json("PUT", BODY), ctx("5"))).status).toBe(404);

    mockPrisma.menuPage.update.mockRejectedValueOnce(Object.assign(new Error("dup"), { code: "P2002" }));
    expect((await PUT(json("PUT", BODY), ctx("5"))).status).toBe(409);
  });

  it("DELETE: 204 for admins, 401 otherwise, 404 when missing", async () => {
    cookieToken = undefined;
    expect((await DELETE(json("DELETE"), ctx("5"))).status).toBe(401);
    expect(mockPrisma.menuPage.delete).not.toHaveBeenCalled();

    cookieToken = "good-token";
    mockPrisma.menuPage.delete.mockResolvedValueOnce({ id: 5 });
    expect((await DELETE(json("DELETE"), ctx("5"))).status).toBe(204);
    expect(mockPrisma.menuPage.delete).toHaveBeenCalledWith({ where: { id: 5 } });

    mockPrisma.menuPage.delete.mockRejectedValueOnce(Object.assign(new Error("gone"), { code: "P2025" }));
    expect((await DELETE(json("DELETE"), ctx("5"))).status).toBe(404);
  });
});
