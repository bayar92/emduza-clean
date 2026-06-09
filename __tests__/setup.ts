import { vi } from "vitest";

// Tests construct File objects with placeholder Uint8Array bodies (no real
// PNG/JPEG magic bytes). Short-circuit the async validators to only run the
// sync size/MIME check — the magic-byte sniff is exercised in dedicated
// integration tests, not the unit tests that simulate upload flow.
vi.mock("@/utils/fileValidation", async () => {
  const actual = await vi.importActual<
    typeof import("@/utils/fileValidation")
  >("@/utils/fileValidation");
  return {
    ...actual,
    validateImageAsync: async (file: File) => actual.validateImage(file),
    validateVideoAsync: async (file: File) => actual.validateVideo(file),
  };
});

// `revalidatePath` requires Next.js's static generation context, which is
// absent outside a real request lifecycle. Replace it with a no-op so route
// handlers can be unit-tested directly.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
