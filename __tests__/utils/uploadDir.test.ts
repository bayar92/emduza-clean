import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import path from "path";

beforeEach(() => {
  // Start from a clean slate regardless of the machine running the tests.
  vi.stubEnv("UPLOAD_DIR", "");
  vi.stubEnv("RAILWAY_VOLUME_MOUNT_PATH", "");
  // The ephemeral-fs warning is emitted once per module instance.
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

async function load() {
  return (await import("@/utils/uploadDir")).getUploadDir;
}

describe("getUploadDir", () => {
  it("prefers an explicit UPLOAD_DIR", async () => {
    vi.stubEnv("UPLOAD_DIR", "/mnt/custom");
    vi.stubEnv("RAILWAY_VOLUME_MOUNT_PATH", "/data");
    expect((await load())()).toBe("/mnt/custom");
  });

  it("uses the Railway volume when one is attached", async () => {
    vi.stubEnv("RAILWAY_VOLUME_MOUNT_PATH", "/data");
    expect((await load())()).toBe(path.join("/data", "uploads"));
  });

  it("falls back to <cwd>/uploads for local dev without warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "development");
    expect((await load())()).toBe(path.join(process.cwd(), "uploads"));
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns once in production when no persistent storage is configured", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    const getUploadDir = await load();
    getUploadDir();
    getUploadDir();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("WILL BE LOST");
  });

  it("does not warn in production when a volume is attached", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RAILWAY_VOLUME_MOUNT_PATH", "/data");
    (await load())();
    expect(warn).not.toHaveBeenCalled();
  });
});
