import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

function getUploadDir() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
}

async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Report" (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      filename TEXT,
      year INTEGER NOT NULL,
      type TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function saveFile(file: File, origName: string): Promise<string> {
  const safeName = origName.replace(/[^а-яА-ЯөүёÖÜa-zA-Z0-9._\- ]/g, '_');
  const targetDir = path.join(getUploadDir(), 'reports');
  await mkdir(targetDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(targetDir, safeName), Buffer.from(bytes));
  return safeName;
}

export async function GET(req: Request) {
  await ensureTable();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  const rows = type
    ? await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM "Report" WHERE type = $1 ORDER BY year DESC`,
        type
      )
    : await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM "Report" ORDER BY year DESC`
      );

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await ensureTable();
  const form = await req.formData();
  const title = form.get('title')?.toString() || '';
  const year = Number(form.get('year'));
  const type = form.get('type')?.toString() || '';
  const file = form.get('file') as File | null;

  if (!title || !year || !type) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  let filename: string | null = null;
  if (file && file.size > 0) {
    filename = await saveFile(file, file.name);
  }

  const rows = await prisma.$queryRawUnsafe<any[]>(
    `INSERT INTO "Report" (title, filename, year, type, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
    title, filename, year, type
  );

  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req: Request) {
  await ensureTable();
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));

  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT filename FROM "Report" WHERE id = $1`, id
  );
  if (rows[0]?.filename) {
    const fp = path.join(getUploadDir(), 'reports', rows[0].filename);
    await unlink(fp).catch(() => {});
  }

  await prisma.$executeRawUnsafe(`DELETE FROM "Report" WHERE id = $1`, id);
  return new NextResponse(null, { status: 204 });
}
