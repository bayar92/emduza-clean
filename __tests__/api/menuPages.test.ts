import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = {
  menuPage: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
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

const PAGE = {
  title: "Хөгжлийн бодлого",
  kind: "page",
  slug: "hugjliin-bodlogo",
  parent: "about",
  content: "<p>Сайн</p><script>alert(1)</script>",
  sortOrder: 2,
  published: true,
};
const GROUP = { title: "Тайлан", kind: "group", parent: "", sortOrder: 0, published: true };

type Row = { id: number; kind: "page" | "group"; parent: string; parentId: number | null };
const row = (id: number, kind: "page" | "group", parent = "", parentId: number | null = null): Row => ({
  id,
  kind,
  parent,
  parentId,
});
// 1 = top-level group, 2 = sub-group of 1 (depth 2), 5 = a page
const ROWS: Row[] = [row(1, "group"), row(2, "group", "", 1), row(5, "page")];

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
  mockPrisma.menuPage.findMany.mockReset().mockResolvedValue(ROWS);
  mockPrisma.menuPage.count.mockReset().mockResolvedValue(0);
});

describe("GET /api/menuPages", () => {
  it("is public and returns only published entries (no content)", async () => {
    mockPrisma.menuPage.findMany.mockResolvedValue([
      { id: 1, title: "A", kind: "page", slug: "a", parent: "", parentId: null, sortOrder: 0 },
    ]);
    cookieToken = undefined;
    const res = await GET(json("GET"));
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
    const args = mockPrisma.menuPage.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ published: true });
    expect(args.select).toMatchObject({ kind: true, parentId: true });
    expect(args.select.content).toBeUndefined();
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

  it("?all=1 returns drafts (no published filter) for an admin", async () => {
    const res = await GET(json("GET", undefined, "http://localhost/api/menuPages?all=1"));
    expect(res.status).toBe(200);
    expect(mockPrisma.menuPage.findMany.mock.calls[0][0].where).toBeUndefined();
  });
});

describe("POST /api/menuPages", () => {
  it("rejects non-admins", async () => {
    cookieToken = "forged";
    expect((await POST(json("POST", PAGE))).status).toBe(401);
    expect(mockPrisma.menuPage.create).not.toHaveBeenCalled();
  });

  it("validates input", async () => {
    expect((await POST(json("POST", { ...PAGE, slug: "Bad Slug" }))).status).toBe(400);
    expect((await POST(json("POST", "not json"))).status).toBe(400);
    expect(mockPrisma.menuPage.create).not.toHaveBeenCalled();
  });

  it("creates a page with sanitized content and refreshes the site", async () => {
    mockPrisma.menuPage.create.mockImplementation(async ({ data }) => ({ id: 7, ...data }));
    const res = await POST(json("POST", PAGE));
    expect(res.status).toBe(201);
    const data = mockPrisma.menuPage.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ kind: "page", slug: "hugjliin-bodlogo", parent: "about", parentId: null });
    expect(data.content).toBe("<p>Сайн</p>");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("creates a group: no slug, no content", async () => {
    mockPrisma.menuPage.create.mockImplementation(async ({ data }) => ({ id: 8, ...data }));
    const res = await POST(json("POST", { ...GROUP, slug: "ignored", content: "<p>x</p>" }));
    expect(res.status).toBe(201);
    const data = mockPrisma.menuPage.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ kind: "group", slug: null, content: "" });
  });

  it("creates menu -> sub-menu -> page", async () => {
    mockPrisma.menuPage.create.mockImplementation(async ({ data }) => ({ id: 9, ...data }));
    // sub-menu inside top-level group 1
    expect((await POST(json("POST", { ...GROUP, title: "Дэд", parentId: 1 }))).status).toBe(201);
    // page inside sub-group 2 (depth 3)
    const res = await POST(json("POST", { ...PAGE, parent: "", parentId: 2 }));
    expect(res.status).toBe(201);
    expect(mockPrisma.menuPage.create.mock.calls[1][0].data.parentId).toBe(2);
  });

  it("refuses to nest deeper than 3 levels", async () => {
    const res = await POST(json("POST", { ...GROUP, parentId: 2 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/түвшин/);
    expect(mockPrisma.menuPage.create).not.toHaveBeenCalled();
  });

  it("refuses to put an entry inside a page or a group that does not exist", async () => {
    expect((await POST(json("POST", { ...PAGE, parent: "", parentId: 5 }))).status).toBe(400);
    expect((await POST(json("POST", { ...PAGE, parent: "", parentId: 404 }))).status).toBe(400);
    expect(mockPrisma.menuPage.create).not.toHaveBeenCalled();
  });

  it("returns 409 when the slug is already taken", async () => {
    mockPrisma.menuPage.create.mockRejectedValue(Object.assign(new Error("dup"), { code: "P2002" }));
    const res = await POST(json("POST", PAGE));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/хаяг/i);
  });

  it("returns 500 on unexpected errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockPrisma.menuPage.create.mockRejectedValue(new Error("db down"));
    expect((await POST(json("POST", PAGE))).status).toBe(500);
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
    mockPrisma.menuPage.findUnique.mockResolvedValue({ id: 1, ...PAGE, published: false });
    const res = await GET_ONE(json("GET"), ctx("1"));
    expect(res.status).toBe(200);
    expect((await res.json()).content).toContain("Сайн");
  });

  describe("PUT", () => {
    beforeEach(() => {
      mockPrisma.menuPage.update.mockImplementation(async ({ data }) => ({ id: 5, ...data }));
    });

    it("updates a page with sanitized content", async () => {
      const res = await PUT(json("PUT", PAGE), ctx("5"));
      expect(res.status).toBe(200);
      const args = mockPrisma.menuPage.update.mock.calls[0][0];
      expect(args.where).toEqual({ id: 5 });
      expect(args.data.content).toBe("<p>Сайн</p>");
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("rejects non-admins and invalid bodies", async () => {
      cookieToken = undefined;
      expect((await PUT(json("PUT", PAGE), ctx("5"))).status).toBe(401);
      cookieToken = "good-token";
      expect((await PUT(json("PUT", { ...PAGE, title: "" }), ctx("5"))).status).toBe(400);
    });

    it("404s when the entry does not exist", async () => {
      expect((await PUT(json("PUT", PAGE), ctx("999"))).status).toBe(404);
      expect(mockPrisma.menuPage.update).not.toHaveBeenCalled();
    });

    it("does not allow changing the type of an existing entry", async () => {
      // 5 is a page; trying to turn it into a group
      const res = await PUT(json("PUT", { ...GROUP }), ctx("5"));
      expect(res.status).toBe(400);
      expect((await res.json()).error).toMatch(/төрл/i);
      expect(mockPrisma.menuPage.update).not.toHaveBeenCalled();
    });

    it("does not allow moving a group inside itself or its own sub-menu", async () => {
      expect((await PUT(json("PUT", { ...GROUP, parentId: 1 }), ctx("1"))).status).toBe(400);
      expect((await PUT(json("PUT", { ...GROUP, parentId: 2 }), ctx("1"))).status).toBe(400);
      expect(mockPrisma.menuPage.update).not.toHaveBeenCalled();
    });

    it("does not allow moves that push a branch past 3 levels", async () => {
      // group 1 already has a sub-group below it; a built-in dropdown is one level down
      mockPrisma.menuPage.findMany.mockResolvedValue([...ROWS, row(3, "page", "", 2)]);
      const res = await PUT(json("PUT", { ...GROUP, parent: "about" }), ctx("1"));
      expect(res.status).toBe(400);
    });

    it("maps unique-slug and missing-row database errors", async () => {
      mockPrisma.menuPage.update.mockRejectedValueOnce(Object.assign(new Error("dup"), { code: "P2002" }));
      expect((await PUT(json("PUT", PAGE), ctx("5"))).status).toBe(409);
      mockPrisma.menuPage.update.mockRejectedValueOnce(Object.assign(new Error("gone"), { code: "P2025" }));
      expect((await PUT(json("PUT", PAGE), ctx("5"))).status).toBe(404);
    });
  });

  describe("DELETE", () => {
    it("requires an admin", async () => {
      cookieToken = undefined;
      expect((await DELETE(json("DELETE"), ctx("5"))).status).toBe(401);
      expect(mockPrisma.menuPage.delete).not.toHaveBeenCalled();
    });

    it("deletes an entry with nothing inside", async () => {
      mockPrisma.menuPage.delete.mockResolvedValueOnce({ id: 5 });
      expect((await DELETE(json("DELETE"), ctx("5"))).status).toBe(204);
      expect(mockPrisma.menuPage.delete).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("refuses to delete a group that still has entries inside (409)", async () => {
      mockPrisma.menuPage.count.mockResolvedValue(2);
      const res = await DELETE(json("DELETE"), ctx("1"));
      expect(res.status).toBe(409);
      expect((await res.json()).error).toMatch(/дэд цэс/);
      expect(mockPrisma.menuPage.delete).not.toHaveBeenCalled();
    });

    it("maps the foreign-key guard and missing rows", async () => {
      mockPrisma.menuPage.delete.mockRejectedValueOnce(Object.assign(new Error("fk"), { code: "P2003" }));
      expect((await DELETE(json("DELETE"), ctx("1"))).status).toBe(409);
      mockPrisma.menuPage.delete.mockRejectedValueOnce(Object.assign(new Error("gone"), { code: "P2025" }));
      expect((await DELETE(json("DELETE"), ctx("5"))).status).toBe(404);
    });
  });
});
