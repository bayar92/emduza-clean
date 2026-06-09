import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const ALLOWED_VIDEO_MIME = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  // file-type reports MP4-family containers as 'video/mp4'; quicktime/3gp
  // sometimes report as 'video/3gpp'. We only accept the explicit list above.
]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

// Magic-byte check: read just enough of the start of the file to identify the
// real content type, then compare against the allowlist. This prevents a
// client from claiming `image/png` on an executable or HTML file.
async function detectMime(file: File): Promise<string | null> {
  const head = await file.slice(0, 4100).arrayBuffer();
  const detected = await fileTypeFromBuffer(new Uint8Array(head));
  return detected?.mime ?? null;
}

/**
 * Synchronous shape-check: size + claimed MIME. Kept for backward compatibility
 * with callers that can't await. Prefer `validateImageAsync` for new code.
 */
export function validateImage(file: File): string | null {
  if (file.size === 0) {
    return `Зургийн файл хоосон байна`;
  }
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    return `Зөвхөн зураг (JPEG, PNG, WebP, GIF) оруулна уу`;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `Зургийн хэмжээ 10MB-с хэтрэхгүй байх ёстой`;
  }
  return null;
}

/**
 * Full validation: size + claimed MIME + magic-byte check against the actual
 * file content. Use this on the server before persisting any upload.
 */
export async function validateImageAsync(file: File): Promise<string | null> {
  const shapeErr = validateImage(file);
  if (shapeErr) return shapeErr;

  const realMime = await detectMime(file);
  if (!realMime || !ALLOWED_IMAGE_MIME.has(realMime)) {
    return `Файлын агуулга зургийн форматтай тохирохгүй байна`;
  }
  return null;
}

export function validateVideo(file: File): string | null {
  if (!ALLOWED_VIDEO_MIME.has(file.type)) {
    return `Зөвхөн видео (MP4, WebM, OGG) оруулна уу`;
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return `Видеоны хэмжээ 500MB-с хэтрэхгүй байх ёстой`;
  }
  return null;
}

export async function validateVideoAsync(file: File): Promise<string | null> {
  const shapeErr = validateVideo(file);
  if (shapeErr) return shapeErr;

  const realMime = await detectMime(file);
  if (!realMime || !ALLOWED_VIDEO_MIME.has(realMime)) {
    return `Файлын агуулга видеоны форматтай тохирохгүй байна`;
  }
  return null;
}
