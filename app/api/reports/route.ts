import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { getUploadDir } from '@/utils/uploadDir';

const MAX_REPORT_FILE_SIZE = 100 * 1024 * 1024;

function invalidate(type?: string) {
  if (type === 'financial' || !type) revalidatePath('/taillan/sankhuu');
  if (type === 'activity' || !type) revalidatePath('/taillan/uil-ajillagaa');
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
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  const rows = await prisma.report.findMany({
    where: type ? { type } : undefined,
    orderBy: { year: 'desc' },
  });

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
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
    // Same cap as the Эрх зүй documents. Uploads used to be stopped at 10MB by
    // the framework; now that larger bodies get through, this is the real limit.
    if (file.size > MAX_REPORT_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Файлын хэмжээ 100MB-с хэтрэхгүй байх ёстой' },
        { status: 400 }
      );
    }
    filename = await saveFile(file, file.name);
  }

  const created = await prisma.report.create({
    data: { title, filename, year, type },
  });

  invalidate(type);
  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));

  const existing = await prisma.report.findUnique({
    where: { id },
    select: { filename: true, type: true },
  });

  if (existing?.filename) {
    const fp = path.join(getUploadDir(), 'reports', existing.filename);
    await unlink(fp).catch(() => {});
  }

  await prisma.report.delete({ where: { id } });
  invalidate(existing?.type);
  return new NextResponse(null, { status: 204 });
}
