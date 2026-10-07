import { describe, it, expect } from "vitest";
import {
  DEFAULT_CONTACT,
  mailtoHref,
  safeHttpUrl,
  telHref,
  validateContactInput,
} from "@/utils/contact";

const valid = {
  address: "  Чингисийн өргөн чөлөө, Хан-Уул  ",
  phone: " 77135051 ",
  email: " emduz@gov.mn ",
  socialName: "ЭМДҮЗ",
  socialUrl: " https://www.facebook.com/emduz ",
};

describe("defaults", () => {
  it("hold the contact details the organisation provided", () => {
    expect(DEFAULT_CONTACT.phone).toBe("77135051");
    expect(DEFAULT_CONTACT.email).toBe("emduz@gov.mn");
    expect(DEFAULT_CONTACT.address).toContain("Хан-Уул");
    expect(DEFAULT_CONTACT.socialName).toBe("Эрүүл мэндийн даатгалын үндэсний зөвлөл");
  });
});

describe("validateContactInput", () => {
  it("trims and accepts valid input", () => {
    const r = validateContactInput(valid);
    expect(r).toEqual({
      ok: true,
      data: {
        address: "Чингисийн өргөн чөлөө, Хан-Уул",
        phone: "77135051",
        email: "emduz@gov.mn",
        socialName: "ЭМДҮЗ",
        socialUrl: "https://www.facebook.com/emduz",
      },
    });
  });

  it("allows the social fields to be empty", () => {
    expect(validateContactInput({ ...valid, socialName: "", socialUrl: "" }).ok).toBe(true);
  });

  it.each(["address", "phone", "email"])("requires %s", (key) => {
    expect(validateContactInput({ ...valid, [key]: "   " }).ok).toBe(false);
  });

  it("rejects non-object input", () => {
    expect(validateContactInput(null).ok).toBe(false);
    expect(validateContactInput("x").ok).toBe(false);
  });

  it("rejects malformed e-mail and phone", () => {
    expect(validateContactInput({ ...valid, email: "not-an-email" }).ok).toBe(false);
    expect(validateContactInput({ ...valid, phone: "call me" }).ok).toBe(false);
    expect(validateContactInput({ ...valid, phone: "123" }).ok).toBe(false);
  });

  it("accepts several phone numbers", () => {
    expect(validateContactInput({ ...valid, phone: "7713-5051, +976 7713 5052" }).ok).toBe(true);
  });

  it("rejects non-http(s) social links (javascript: etc.)", () => {
    for (const socialUrl of ["javascript:alert(1)", "data:text/html,x", "ftp://x.mn", "facebook.com/x"]) {
      expect(validateContactInput({ ...valid, socialUrl }).ok).toBe(false);
    }
  });

  it("enforces length limits", () => {
    expect(validateContactInput({ ...valid, address: "a".repeat(301) }).ok).toBe(false);
  });
});

describe("link helpers", () => {
  it("telHref uses the first number and strips formatting", () => {
    expect(telHref("77135051")).toBe("tel:77135051");
    expect(telHref("+976 7713-5051, 7713-5052")).toBe("tel:+97677135051");
    expect(telHref("n/a")).toBeNull();
  });

  it("mailtoHref only builds links for valid addresses", () => {
    expect(mailtoHref("emduz@gov.mn")).toBe("mailto:emduz@gov.mn");
    expect(mailtoHref("nope")).toBeNull();
  });

  it("safeHttpUrl only passes http(s)", () => {
    expect(safeHttpUrl("https://a.mn/x")).toBe("https://a.mn/x");
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("")).toBeNull();
    expect(safeHttpUrl(undefined)).toBeNull();
  });
});
