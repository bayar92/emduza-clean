import { describe, it, expect } from "vitest";
import {
  CATEGORY_HURALDAAN,
  CATEGORY_HYNALT,
  CATEGORY_TEKHNIK,
  NEWS_CATEGORY_OPTIONS,
  categoryValues,
  normalizeCategory,
  sameCategory,
} from "@/utils/newsCategories";

describe("normalizeCategory", () => {
  it("maps the old spellings the admin form used to save to the current names", () => {
    expect(normalizeCategory("Хяналт үнэлгээ")).toBe(CATEGORY_HYNALT);
    expect(normalizeCategory("ЭМДҮЗ-ийн хуралдаан")).toBe(CATEGORY_HURALDAAN);
  });

  it("leaves current names and everything else untouched", () => {
    for (const c of [CATEGORY_HYNALT, CATEGORY_HURALDAAN, CATEGORY_TEKHNIK, "Мэдээлэл", "Онцлох мэдээ", "бусад"]) {
      expect(normalizeCategory(c)).toBe(c);
    }
  });
});

describe("categoryValues", () => {
  it("lists the current name first, then every old spelling still stored for it", () => {
    expect(categoryValues(CATEGORY_HYNALT)).toEqual([CATEGORY_HYNALT, "Хяналт үнэлгээ"]);
    expect(categoryValues(CATEGORY_HURALDAAN)).toEqual([CATEGORY_HURALDAAN, "ЭМДҮЗ-ийн хуралдаан"]);
  });

  it("is just the category itself when nothing old maps to it", () => {
    expect(categoryValues(CATEGORY_TEKHNIK)).toEqual([CATEGORY_TEKHNIK]);
    expect(categoryValues("Мэдээлэл")).toEqual(["Мэдээлэл"]);
  });

  it("gives the same answer when asked with an old spelling", () => {
    expect(categoryValues("Хяналт үнэлгээ")).toEqual(categoryValues(CATEGORY_HYNALT));
  });
});

describe("sameCategory", () => {
  it("treats an old spelling and its current name as one category", () => {
    expect(sameCategory("Хяналт үнэлгээ", CATEGORY_HYNALT)).toBe(true);
    expect(sameCategory(CATEGORY_HYNALT, "Хяналт үнэлгээ")).toBe(true);
    expect(sameCategory("ЭМДҮЗ-ийн хуралдаан", CATEGORY_HURALDAAN)).toBe(true);
  });

  it("still tells different categories apart", () => {
    expect(sameCategory(CATEGORY_HYNALT, CATEGORY_TEKHNIK)).toBe(false);
    expect(sameCategory("Мэдээлэл", "Онцлох мэдээ")).toBe(false);
  });
});

describe("NEWS_CATEGORY_OPTIONS (what the news form can save)", () => {
  const values = NEWS_CATEGORY_OPTIONS.map((o) => o.value as string);

  it("offers each category once", () => {
    expect(new Set(values).size).toBe(values.length);
  });

  it("includes every category that has its own sub-menu page", () => {
    for (const c of [CATEGORY_HURALDAAN, CATEGORY_TEKHNIK, CATEGORY_HYNALT]) {
      expect(values).toContain(c);
    }
  });

  it("can no longer write an old spelling, so the form and the pages cannot disagree again", () => {
    for (const v of values) expect(normalizeCategory(v)).toBe(v);
  });
});
