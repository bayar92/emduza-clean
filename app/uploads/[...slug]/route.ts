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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug: routeSlug } = await params;
    // Security: prevent path traversal attacks
    const slug = routeSlug.map((s) => s.replace(/\.\./g, ''));
    const ext = slug[slug.length - 1].split('.').pop()?.toLowerCase() ?? '';
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

    const uploadDir =
      process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

    // Try new location first (outside public/)
    try {
      const file = await readFile(path.join(uploadDir, ...slug));
      return new NextResponse(file, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      // Fall back to legacy location (public/uploads/) for existing files
      const legacyPath = path.join(process.cwd(), 'public', 'uploads', ...slug);
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
