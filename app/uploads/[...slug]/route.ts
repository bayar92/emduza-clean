import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jfif: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

/**
 * Resolve `requestedPath` against `baseDir` and verify the result is still
 * inside `baseDir`. Returns the safe absolute path, or `null` if the requested
 * path escapes the base (path traversal attempt or absolute path injection).
 */
function safeResolve(baseDir: string, ...segments: string[]): string | null {
  const resolvedBase = path.resolve(baseDir);
  const resolved = path.resolve(resolvedBase, ...segments);
  // Path must be the base itself or contained inside it (with separator).
  if (
    resolved !== resolvedBase &&
    !resolved.startsWith(resolvedBase + path.sep)
  ) {
    return null;
  }
  return resolved;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug: routeSlug } = await params;

    // Reject any segment containing path separators, absolute prefixes, NUL
    // bytes, or `..` — these are not valid filename components.
    for (const seg of routeSlug) {
      if (
        !seg ||
        seg === '.' ||
        seg === '..' ||
        seg.includes('/') ||
        seg.includes('\\') ||
        seg.includes('\0')
      ) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
    }

    const lastSeg = routeSlug[routeSlug.length - 1];
    const ext = lastSeg.split('.').pop()?.toLowerCase() ?? '';
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

    const newPath = safeResolve(uploadDir, ...routeSlug);
    const legacyPath = safeResolve(
      path.join(process.cwd(), 'public', 'uploads'),
      ...routeSlug
    );

    if (!newPath || !legacyPath) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Try new location first (outside public/)
    try {
      const file = await readFile(newPath);
      return new NextResponse(file, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      // Fall back to legacy location (public/uploads/) for existing files
      const file = await readFile(legacyPath);
      return new NextResponse(file, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
