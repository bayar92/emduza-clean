import { describe, it, expect } from "vitest";
import {
  BUILTIN_MENUS,
  MAX_MENU_DEPTH,
  ancestorInfo,
  buildAdminSections,
  buildMenuTree,
  buildPlacementOptions,
  decodePlacement,
  depthOf,
  descendantDepth,
  encodePlacement,
  pageHref,
  parentLabel,
  slugify,
  validateMenuPageInput,
  validatePlacement,
  type AdminMenuRow,
  type CustomMenuPage,
  type TreeRow,
} from "@/utils/menuPages";

const valid = {
  title: "  Хөгжлийн бодлого ",
  slug: "Hugjliin-Bodlogo",
  parent: "about",
  content: "<p>Сайн байна уу</p>",
  sortOrder: 3,
  published: true,
};

describe("slugify", () => {
  it("transliterates Mongolian Cyrillic into a URL-safe slug", () => {
    expect(slugify("Хөгжлийн бодлого")).toBe("khugjliin-bodlogo");
    expect(slugify("Үйл ажиллагаа")).toBe("uil-ajillagaa");
  });

  it("handles mixed text, symbols and extra spaces", () => {
    expect(slugify("  ЭМДҮЗ — 2026 он!  ")).toBe("emduz-2026-on");
  });

  it("returns an empty string when nothing usable remains", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("")).toBe("");
  });

  it("caps the length without leaving a trailing dash", () => {
    const s = slugify("а ".repeat(100));
    expect(s.length).toBeLessThanOrEqual(80);
    expect(s.endsWith("-")).toBe(false);
  });
});

describe("pageHref / parentLabel", () => {
  it("builds the public URL", () => {
    expect(pageHref("abc")).toBe("/khuudas/abc");
  });
  it("labels built-in parents and the top level", () => {
    expect(parentLabel("about")).toBe("Бидний тухай");
    expect(parentLabel("")).toMatch(/Үндсэн цэс/);
  });
});

describe("validateMenuPageInput", () => {
  it("trims, lower-cases the slug and applies defaults for a page", () => {
    expect(validateMenuPageInput(valid)).toEqual({
      ok: true,
      data: {
        title: "Хөгжлийн бодлого",
        kind: "page",
        slug: "hugjliin-bodlogo",
        parent: "about",
        parentId: null,
        content: "<p>Сайн байна уу</p>",
        sortOrder: 3,
        published: true,
      },
    });
  });

  it("defaults sortOrder to 0, published to true and kind to page", () => {
    expect(validateMenuPageInput({ title: "A", slug: "a" })).toMatchObject({
      ok: true,
      data: { kind: "page", sortOrder: 0, published: true, parent: "", parentId: null, content: "" },
    });
  });

  it("accepts published=false (draft)", () => {
    expect(validateMenuPageInput({ ...valid, published: false })).toMatchObject({
      ok: true,
      data: { published: false },
    });
  });

  describe("groups", () => {
    it("need no slug and carry no content", () => {
      const r = validateMenuPageInput({ title: "Тайлан", kind: "group", slug: "ignored", content: "<p>x</p>" });
      expect(r).toMatchObject({ ok: true, data: { kind: "group", slug: null, content: "" } });
    });

    it("still require a title", () => {
      expect(validateMenuPageInput({ kind: "group", title: " " }).ok).toBe(false);
    });
  });

  describe("placement fields", () => {
    it("accepts a numeric parentId (also as a string)", () => {
      expect(validateMenuPageInput({ ...valid, parent: "", parentId: 4 })).toMatchObject({ ok: true, data: { parentId: 4 } });
      expect(validateMenuPageInput({ ...valid, parent: "", parentId: "4" })).toMatchObject({ ok: true, data: { parentId: 4 } });
    });

    it("treats null / empty parentId as top level", () => {
      expect(validateMenuPageInput({ ...valid, parent: "", parentId: null })).toMatchObject({ ok: true, data: { parentId: null } });
      expect(validateMenuPageInput({ ...valid, parent: "", parentId: "" })).toMatchObject({ ok: true, data: { parentId: null } });
    });

    it("rejects choosing a built-in parent and a group at once", () => {
      expect(validateMenuPageInput({ ...valid, parent: "about", parentId: 4 }).ok).toBe(false);
    });

    it.each([0, -1, 1.5, "abc"])("rejects parentId %s", (parentId) => {
      expect(validateMenuPageInput({ ...valid, parent: "", parentId }).ok).toBe(false);
    });
  });

  it.each([
    ["missing title", { ...valid, title: "  " }],
    ["missing slug", { ...valid, slug: "" }],
    ["slug with a space", { ...valid, slug: "bad slug!" }],
    ["slug with leading dash", { ...valid, slug: "-abc" }],
    ["slug with cyrillic", { ...valid, slug: "бодлого" }],
    ["unknown built-in parent", { ...valid, parent: "nope" }],
    ["unknown kind", { ...valid, kind: "folder" }],
    ["non-integer order", { ...valid, sortOrder: 1.5 }],
    ["order out of range", { ...valid, sortOrder: 100000 }],
    ["too-long title", { ...valid, title: "x".repeat(101) }],
    ["too-long content", { ...valid, content: "x".repeat(200_001) }],
  ])("rejects %s", (_name, input) => {
    expect(validateMenuPageInput(input).ok).toBe(false);
  });

  it("rejects non-object input", () => {
    expect(validateMenuPageInput(null).ok).toBe(false);
    expect(validateMenuPageInput("x").ok).toBe(false);
  });
});

/* ── tree structure ──────────────────────────────────────────────────────── */

const row = (id: number, kind: "page" | "group", parent = "", parentId: number | null = null): TreeRow => ({
  id,
  kind,
  parent,
  parentId,
});

// 1 group (top)        depth 1
//  └ 2 group           depth 2
//     └ 3 page         depth 3
// 4 group in "about"   depth 2
// 5 page (top)         depth 1
const tree: TreeRow[] = [
  row(1, "group"),
  row(2, "group", "", 1),
  row(3, "page", "", 2),
  row(4, "group", "about"),
  row(5, "page"),
];

describe("depthOf / descendantDepth", () => {
  it("counts the built-in dropdown as level 1", () => {
    expect(depthOf(tree, 1)).toBe(1);
    expect(depthOf(tree, 2)).toBe(2);
    expect(depthOf(tree, 3)).toBe(3);
    expect(depthOf(tree, 4)).toBe(2);
    expect(depthOf(tree, 5)).toBe(1);
  });

  it("measures how deep a branch goes below an entry", () => {
    expect(descendantDepth(tree, 1)).toBe(2);
    expect(descendantDepth(tree, 2)).toBe(1);
    expect(descendantDepth(tree, 3)).toBe(0);
    expect(descendantDepth(tree, 5)).toBe(0);
  });

  it("does not hang on corrupt cyclic data", () => {
    const cyc = [row(1, "group", "", 2), row(2, "group", "", 1)];
    expect(depthOf(cyc, 1)).toBeGreaterThan(MAX_MENU_DEPTH);
    expect(descendantDepth(cyc, 1)).toBeLessThan(5);
  });
});

describe("validatePlacement", () => {
  const ok = (p: Parameters<typeof validatePlacement>[1]) => validatePlacement(tree, p);

  it("allows top level and built-in dropdowns for pages and groups", () => {
    expect(ok({ kind: "page", parent: "", parentId: null })).toBeNull();
    expect(ok({ kind: "group", parent: "", parentId: null })).toBeNull();
    expect(ok({ kind: "page", parent: "about", parentId: null })).toBeNull();
    expect(ok({ kind: "group", parent: "law", parentId: null })).toBeNull();
  });

  it("allows menu -> sub-menu -> page", () => {
    expect(ok({ kind: "group", parent: "", parentId: 1 })).toBeNull(); // sub-menu (depth 2)
    expect(ok({ kind: "page", parent: "", parentId: 2 })).toBeNull(); // page (depth 3)
    expect(ok({ kind: "page", parent: "", parentId: 4 })).toBeNull(); // page inside a group in a built-in dropdown
  });

  it("refuses to nest deeper than the limit", () => {
    // 2 is a depth-2 group: a group inside it would be depth 3 and unusable
    expect(ok({ kind: "group", parent: "", parentId: 2 })).toMatch(/түвшин/);
    expect(ok({ kind: "group", parent: "", parentId: 4 })).toMatch(/түвшин/);
  });

  it("only lets entries go inside groups that exist", () => {
    expect(ok({ kind: "page", parent: "", parentId: 5 })).toMatch(/бүлэг/); // 5 is a page
    expect(ok({ kind: "page", parent: "", parentId: 999 })).toMatch(/олдсонгүй/);
  });

  it("stops a group being moved inside itself or its own descendants", () => {
    expect(ok({ id: 1, kind: "group", parent: "", parentId: 1 })).toMatch(/өөрийнх/);
    expect(ok({ id: 1, kind: "group", parent: "", parentId: 2 })).toMatch(/өөрийнх/);
  });

  it("counts the branch below an entry when it is moved", () => {
    // group 1 carries two levels below it, so putting it in a built-in dropdown
    // (depth 2) would push page 3 to depth 4
    expect(ok({ id: 1, kind: "group", parent: "about", parentId: null })).toMatch(/түвшин/);
    // moving it within the top level changes nothing
    expect(ok({ id: 1, kind: "group", parent: "", parentId: null })).toBeNull();
  });
});

/* ── navigation tree ─────────────────────────────────────────────────────── */

const page = (
  id: number,
  p: Partial<CustomMenuPage> = {}
): CustomMenuPage => ({
  id,
  title: `P${id}`,
  kind: "page",
  slug: `p${id}`,
  parent: "",
  parentId: null,
  sortOrder: 0,
  ...p,
});
const group = (id: number, p: Partial<CustomMenuPage> = {}) =>
  page(id, { kind: "group", slug: null, title: `G${id}`, ...p });

describe("buildMenuTree", () => {
  it("splits top-level entries from those inside built-in dropdowns, ordered by sortOrder then id", () => {
    const { topLevel, byBuiltin } = buildMenuTree([
      page(1, { sortOrder: 5 }),
      page(2, { parent: "about", sortOrder: 2 }),
      page(3, { parent: "about", sortOrder: 1 }),
      page(4, { sortOrder: 1 }),
      page(5, { parent: "law" }),
    ]);
    expect(topLevel.map((n) => n.id)).toEqual([4, 1]);
    expect(byBuiltin.about.map((n) => n.id)).toEqual([3, 2]);
    expect(byBuiltin.law.map((n) => n.id)).toEqual([5]);
  });

  it("nests groups to any depth supplied", () => {
    const { topLevel } = buildMenuTree([
      group(1),
      group(2, { parentId: 1 }),
      page(3, { parentId: 2 }),
      page(4, { parentId: 1, sortOrder: 1 }),
    ]);
    expect(topLevel).toHaveLength(1);
    const g1 = topLevel[0];
    expect(g1.kind).toBe("group");
    expect(g1.children.map((c) => c.id)).toEqual([2, 4]);
    expect(g1.children[0].children.map((c) => c.id)).toEqual([3]);
  });

  it("drops groups with nothing visible inside", () => {
    const { topLevel } = buildMenuTree([group(1), group(2, { parentId: 1 }), page(9)]);
    expect(topLevel.map((n) => n.id)).toEqual([9]);
  });

  it("drops entries whose group is missing (e.g. an unpublished group hides its branch)", () => {
    const { topLevel } = buildMenuTree([page(2, { parentId: 1 }), page(9)]);
    expect(topLevel.map((n) => n.id)).toEqual([9]);
  });

  it("falls back to top level for an unknown built-in parent so entries never vanish", () => {
    const { topLevel, byBuiltin } = buildMenuTree([page(1, { parent: "removed" })]);
    expect(topLevel.map((n) => n.id)).toEqual([1]);
    expect(byBuiltin).toEqual({});
  });

  it("ignores a page that has no slug", () => {
    expect(buildMenuTree([page(1, { slug: null })]).topLevel).toEqual([]);
  });

  it("does not mutate its input", () => {
    const input = [page(2, { sortOrder: 2 }), page(1, { sortOrder: 1 })];
    buildMenuTree(input);
    expect(input.map((p) => p.id)).toEqual([2, 1]);
  });

  it("knows every built-in dropdown", () => {
    expect(BUILTIN_MENUS.map((m) => m.id)).toEqual(["about", "news", "law", "report", "dans"]);
  });
});

/* ── admin helpers ───────────────────────────────────────────────────────── */

const arow = (id: number, p: Partial<AdminMenuRow> = {}): AdminMenuRow => ({
  ...page(id),
  published: true,
  ...p,
});

describe("encodePlacement / decodePlacement", () => {
  it("round-trips every kind of placement", () => {
    for (const [parent, parentId] of [["", null], ["about", null], ["", 7]] as const) {
      expect(decodePlacement(encodePlacement(parent, parentId))).toEqual({ parent, parentId });
    }
    expect(encodePlacement("", null)).toBe("");
    expect(encodePlacement("law", null)).toBe("b:law");
    expect(encodePlacement("", 7)).toBe("c:7");
  });

  it("treats garbage as top level", () => {
    expect(decodePlacement("c:abc")).toEqual({ parent: "", parentId: null });
    expect(decodePlacement("x")).toEqual({ parent: "", parentId: null });
  });
});

describe("ancestorInfo", () => {
  const rows = [
    arow(1, { kind: "group", slug: null, title: "A", parent: "about" }),
    arow(2, { kind: "group", slug: null, title: "B", parentId: 1 }),
  ];
  it("returns the groups root-first and the built-in dropdown at the root", () => {
    expect(ancestorInfo(rows, 2)).toEqual({
      chain: [{ id: 1, title: "A" }, { id: 2, title: "B" }],
      rootBuiltin: "about",
    });
  });
  it("is empty for a top-level placement", () => {
    expect(ancestorInfo(rows, null)).toEqual({ chain: [], rootBuiltin: "" });
  });
});

describe("buildPlacementOptions", () => {
  const rows: AdminMenuRow[] = [
    arow(1, { kind: "group", slug: null, title: "Тайлан А" }), // top, depth 1
    arow(2, { kind: "group", slug: null, title: "Дэд", parentId: 1 }), // depth 2
    arow(3, { kind: "group", slug: null, title: "Эрх", parent: "law" }), // depth 2
    arow(4),
  ];
  const values = (o: { value: string }[]) => o.map((x) => x.value);

  it("offers top level, every built-in dropdown and every group with room, for a page", () => {
    const o = buildPlacementOptions(rows, { kind: "page" });
    expect(values(o)).toEqual(["", "b:about", "b:news", "b:law", "b:report", "b:dans", "c:1", "c:2", "c:3"]);
  });

  it("labels nested groups with their full path", () => {
    const o = buildPlacementOptions(rows, { kind: "page" });
    expect(o.find((x) => x.value === "c:2")!.label).toContain("Тайлан А › Дэд");
    expect(o.find((x) => x.value === "c:3")!.label).toContain("Эрх зүй › Эрх");
  });

  it("offers only groups that can still hold another group when adding a group", () => {
    const o = buildPlacementOptions(rows, { kind: "group" });
    expect(values(o)).toEqual(["", "b:about", "b:news", "b:law", "b:report", "b:dans", "c:1"]);
  });

  it("never offers the entry being edited or anything inside it", () => {
    const o = buildPlacementOptions(rows, { kind: "page", excludeId: 1 });
    expect(values(o)).not.toContain("c:1");
    expect(values(o)).not.toContain("c:2");
    expect(values(o)).toContain("c:3");
  });
});

describe("buildAdminSections", () => {
  it("groups drafts and published entries by where they hang from and nests children", () => {
    const sections = buildAdminSections([
      arow(1, { kind: "group", slug: null, title: "G" }),
      arow(2, { parentId: 1, published: false }),
      arow(3, { parent: "about" }),
      arow(4, { parent: "removed-group" }),
    ]);
    expect(sections.map((s) => s.key)).toEqual(["", "about"]);
    const top = sections[0].nodes;
    expect(top.map((n) => n.id)).toEqual([1, 4]); // unknown parent lands at top level
    expect(top[0].children.map((c) => [c.id, c.published])).toEqual([[2, false]]);
    expect(sections[1].nodes.map((n) => n.id)).toEqual([3]);
  });

  it("omits empty sections", () => {
    expect(buildAdminSections([])).toEqual([]);
  });
});
