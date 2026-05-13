import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fs/promises before importing the module under test
vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { mkdir, writeFile } from "fs/promises";
import { saveUploadedFile } from "@/utils/uploadFile";

function makeFile(name: string, type: string, content = "data"): File {
  return new File([content], name, { type });
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.UPLOAD_DIR;
});

describe("saveUploadedFile", () => {
  it("returns a /uploads URL path", async () => {
    const file = makeFile("photo.jpg", "image/jpeg");
    const result = await saveUploadedFile(file, "news", "abc");
    expect(result).toMatch(/^\/uploads\/news\//);
  });

  it("creates the target directory with mkdir", async () => {
    const file = makeFile("photo.png", "image/png");
    await saveUploadedFile(file, "img/tech", "pfx");
    expect(mkdir).toHaveBeenCalledWith(
      expect.stringContaining("img/tech"),
      { recursive: true }
    );
  });

  it("writes the file buffer to disk", async () => {
    const file = makeFile("clip.mp4", "video/mp4", "videobytes");
    await saveUploadedFile(file, "video", "pfx");
    expect(writeFile).toHaveBeenCalledOnce();
    const [filePath, buffer] = (writeFile as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(filePath).toContain("video");
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  it("sanitizes unsafe characters in the filename", async () => {
    const file = makeFile("фото зураг!@#$.jpg", "image/jpeg");
    const result = await saveUploadedFile(file, "news", "pfx");
    // Result URL should only contain safe chars after the prefix section
    expect(result).toMatch(/^\/uploads\/news\/pfx-\d+-[a-zA-Z0-9._-]+$/);
  });

  it("uses UPLOAD_DIR env variable when set", async () => {
    process.env.UPLOAD_DIR = "/mnt/data";
    const file = makeFile("a.jpg", "image/jpeg");
    await saveUploadedFile(file, "news", "pfx");
    expect(mkdir).toHaveBeenCalledWith(
      expect.stringContaining("/mnt/data"),
      expect.anything()
    );
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining("/mnt/data"),
      expect.anything()
    );
  });

  it("includes the prefix in the filename", async () => {
    const file = makeFile("img.jpg", "image/jpeg");
    const result = await saveUploadedFile(file, "news", "myprefix");
    expect(result).toContain("myprefix");
  });
});
