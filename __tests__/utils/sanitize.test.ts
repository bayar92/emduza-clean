import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "@/utils/sanitize";

describe("sanitizeHtml", () => {
  it("keeps what the editor's formatting buttons produce", () => {
    const html =
      '<h2>Гарчиг</h2><p style="text-align:center"><strong>b</strong> <em>i</em> <u>u</u> <s>s</s> <mark>hi</mark></p><ul><li>x</li></ul><hr>';
    const out = sanitizeHtml(html);
    for (const needle of ["<h2>", "<u>u</u>", "<s>s</s>", "<mark>hi</mark>", "<hr>", "text-align:center", "<ul>"]) {
      expect(out).toContain(needle);
    }
  });

  it("keeps images and safe links", () => {
    const out = sanitizeHtml('<img src="/uploads/editor/a.png" alt="x"><a href="https://a.mn" target="_blank" rel="noopener">l</a>');
    expect(out).toContain('src="/uploads/editor/a.png"');
    expect(out).toContain('href="https://a.mn"');
  });

  it("strips scripts, event handlers and javascript: URLs", () => {
    const out = sanitizeHtml(
      '<p onclick="x()">a</p><script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">l</a><iframe src="//evil"></iframe>'
    );
    expect(out).not.toMatch(/script|onclick|onerror|javascript:|iframe/i);
    expect(out).toContain("<p>a</p>");
  });

  it("returns an empty string for empty input", () => {
    expect(sanitizeHtml("")).toBe("");
    expect(sanitizeHtml(null)).toBe("");
    expect(sanitizeHtml(undefined)).toBe("");
  });
});
