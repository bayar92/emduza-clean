import { describe, it, expect } from "vitest";
import { validateImage, validateVideo } from "@/utils/fileValidation";

function makeFile(name: string, type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

const MB = 1024 * 1024;

// ---------------------------------------------------------------------------
// validateImage
// ---------------------------------------------------------------------------
describe("validateImage", () => {
  it("returns null for a valid JPEG under limit", () => {
    const file = makeFile("photo.jpg", "image/jpeg", 1 * MB);
    expect(validateImage(file)).toBeNull();
  });

  it("returns null for a valid PNG", () => {
    expect(validateImage(makeFile("a.png", "image/png", 500))).toBeNull();
  });

  it("returns null for a valid WebP", () => {
    expect(validateImage(makeFile("a.webp", "image/webp", 500))).toBeNull();
  });

  it("returns null for a valid GIF", () => {
    expect(validateImage(makeFile("a.gif", "image/gif", 500))).toBeNull();
  });

  it("returns error for an empty file", () => {
    const file = makeFile("empty.jpg", "image/jpeg", 0);
    expect(validateImage(file)).toMatch(/хоосон/);
  });

  it("returns error for a disallowed MIME type", () => {
    const file = makeFile("doc.pdf", "application/pdf", 1000);
    expect(validateImage(file)).toMatch(/JPEG|PNG|WebP/);
  });

  it("returns error when file exceeds 10 MB", () => {
    const file = makeFile("big.jpg", "image/jpeg", 11 * MB);
    expect(validateImage(file)).toMatch(/10MB/);
  });

  it("accepts a file exactly at the 10 MB limit", () => {
    const file = makeFile("edge.jpg", "image/jpeg", 10 * MB);
    expect(validateImage(file)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validateVideo
// ---------------------------------------------------------------------------
describe("validateVideo", () => {
  it("returns null for a valid MP4 under limit", () => {
    const file = makeFile("v.mp4", "video/mp4", 10 * MB);
    expect(validateVideo(file)).toBeNull();
  });

  it("returns null for WebM", () => {
    expect(validateVideo(makeFile("v.webm", "video/webm", 1 * MB))).toBeNull();
  });

  it("returns null for OGG", () => {
    expect(validateVideo(makeFile("v.ogg", "video/ogg", 1 * MB))).toBeNull();
  });

  it("returns null for QuickTime", () => {
    expect(
      validateVideo(makeFile("v.mov", "video/quicktime", 1 * MB))
    ).toBeNull();
  });

  it("returns error for a disallowed MIME type", () => {
    const file = makeFile("a.avi", "video/x-msvideo", 1 * MB);
    expect(validateVideo(file)).toMatch(/MP4|WebM|OGG/);
  });

  it("returns error when file exceeds 500 MB", () => {
    const file = makeFile("huge.mp4", "video/mp4", 0);
    Object.defineProperty(file, "size", { value: 501 * MB });
    expect(validateVideo(file)).toMatch(/500MB/);
  });

  it("accepts a file exactly at the 500 MB limit", () => {
    const file = makeFile("edge.mp4", "video/mp4", 0);
    Object.defineProperty(file, "size", { value: 500 * MB });
    expect(validateVideo(file)).toBeNull();
  });
});
