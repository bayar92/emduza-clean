import { describe, it, expect } from "vitest";
import {
  BUILTIN_MENUS,
  groupCustomPages,
  pageHref,
  parentLabel,
  slugify,
  validateMenuPageInput,
  type CustomMenuPage,
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
  it("labels built-in parents and the standalone case", () => {
    expect(parentLabel("about")).toBe("Бидний тухай");
    expect(parentLabel("")).toMatch(/Үндсэн цэс/);
  });
});

describe("validateMenuPageInput", () => {
  it("trims, lower-cases the slug and applies defaults", () => {
    const r = validateMenuPageInput(valid);
    expect(r).toEqual({
      ok: true,
      data: {
        title: "Хөгжлийн бодлого",
        slug: "hugjliin-bodlogo",
        parent: "about",
        content: "<p>Сайн байна уу</p>",
        sortOrder: 3,
        published: true,
      },
    });
  });

  it("defaults sortOrder to 0 and published to true", () => {
    const r = validateMenuPageInput({ title: "A", slug: "a" });
    expect(r).toMatchObject({ ok: true, data: { sortOrder: 0, published: true, parent: "", content: "" } });
  });

  it("accepts published=false (draft)", () => {
    expect(validateMenuPageInput({ ...valid, published: false })).toMatchObject({
      ok: true,
      data: { published: false },
    });
  });

  it.each([
    ["missing title", { ...valid, title: "  " }],
    ["missing slug", { ...valid, slug: "" }],
    ["slug with uppercase-invalid chars", { ...valid, slug: "bad slug!" }],
    ["slug with leading dash", { ...valid, slug: "-abc" }],
    ["slug with cyrillic", { ...valid, slug: "бодлого" }],
    ["unknown parent", { ...valid, parent: "nope" }],
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

describe("groupCustomPages", () => {
  const page = (id: number, parent: string, sortOrder = 0): CustomMenuPage => ({
    id,
    title: `P${id}`,
    slug: `p${id}`,
    parent,
    sortOrder,
  });

  it("splits standalone links from dropdown children, sorted by order then id", () => {
    const { standalone, byGroup } = groupCustomPages([
      page(1, "", 5),
      page(2, "about", 2),
      page(3, "about", 1),
      page(4, "", 1),
      page(5, "law", 0),
    ]);
    expect(standalone.map((p) => p.id)).toEqual([4, 1]);
    expect(byGroup.about.map((p) => p.id)).toEqual([3, 2]);
    expect(byGroup.law.map((p) => p.id)).toEqual([5]);
  });

  it("falls back to standalone for an unknown parent so pages never vanish", () => {
    const { standalone, byGroup } = groupCustomPages([page(1, "removed-group")]);
    expect(standalone.map((p) => p.id)).toEqual([1]);
    expect(byGroup).toEqual({});
  });

  it("does not mutate its input", () => {
    const input = [page(2, "", 2), page(1, "", 1)];
    groupCustomPages(input);
    expect(input.map((p) => p.id)).toEqual([2, 1]);
  });

  it("knows every built-in group", () => {
    expect(BUILTIN_MENUS.map((m) => m.id)).toEqual(["about", "news", "law", "report", "dans"]);
  });
});
