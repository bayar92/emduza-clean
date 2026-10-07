import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUploadDir } from "./uploadDir";

/**
 * Saves an uploaded file outside of public/ and returns a URL path (/uploads/...).
 * All /uploads/... requests are handled by app/uploads/[...slug]/route.ts,
 * which bypasses nginx static file serving — fixing 404s in Docker/production.
 *
 * In production the target directory MUST be on a persistent volume — see
 * getUploadDir() in ./uploadDir for how it is resolved.
 */
export async function saveUploadedFile(
  file: File,
  subDir: string,
  prefix: string
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Sanitize filename: keep only safe characters
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileName = `${prefix}-${Date.now()}-${safeFileName}`;

  const targetDir = path.join(getUploadDir(), subDir);
  await mkdir(targetDir, { recursive: true });

  await writeFile(path.join(targetDir, fileName), buffer);

  // Return URL path — served by app/uploads/[...slug]/route.ts
  return `/uploads/${subDir}/${fileName}`;
}
