import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/utils/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

function invalidate() {
  revalidatePath('/erkhzui');
  revalidatePath('/erkhzui/shiidwer');
  revalidatePath('/erkhzui/togtool');
  revalidatePath('/erkhzui/emduz-togtool');
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const MAX_FILE_SIZE = 100 * 1024 * 1024;

function sanitizeFilename(name: string): string {
  return path.basename(name).replace(/[^а-яА-ЯөүёÖÜa-zA-Z0-9._\- ]/g, '_');
}

// Validates and saves an uploaded committee document, returning its stored
// filename. Shared by POST (new entry) and PUT (replacing an existing
// entry's file) so both go through the same checks.
async function saveCommitteeFile(file: File): Promise<string | { error: string }> {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { error: 'Зөвхөн PDF, Word, Excel файл оруулна уу' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: 'Файлын хэмжээ 100MB-с хэтрэхгүй байх ёстой' };
  }

  const bytes = await file.arrayBuffer();
  const safeName = sanitizeFilename(file.name);
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  const targetDir = path.join(uploadDir, 'file');
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, safeName), Buffer.from(bytes));

  return safeName;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));

    const sortBy = ['createdAt', 'text', 'category'].includes(
      searchParams.get('sortBy') || ''
    )
      ? searchParams.get('sortBy')!
      : 'createdAt';

    const sortOrder = ['asc', 'desc'].includes(
      searchParams.get('sortOrder') || ''
    )
      ? searchParams.get('sortOrder')!
      : 'desc';

    const skip = (page - 1) * limit;

    const stcommittee = await prisma.stCommittee.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    const total = await prisma.stCommittee.count();

    return NextResponse.json({ stcommittee, currentCommittee: total });
  } catch {
    return NextResponse.json(
      { error: 'Error fetching committee' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const text = form.get('text')?.toString() || '';
    const category = form.get('category')?.toString() || '';
    const date = form.get('date')?.toString() || '';
    const number = form.get('number')?.toString() || '';

    if (!text || !category || !date || !number) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const file = form.get('file') as File | null;
    let filename: string | null = null;

    if (file) {
      const result = await saveCommitteeFile(file);
      if (typeof result !== 'string') {
        return NextResponse.json(result, { status: 400 });
      }
      filename = result;
    }

    const dateObj = new Date(date);

    const committee = await prisma.stCommittee.create({
      data: {
        text,
        category,
        filename,
        Date: dateObj,
        day: dateObj.getDate(),
        month: dateObj.getMonth() + 1,
        number: parseInt(number, 10),
      },
    });

    invalidate();
    return NextResponse.json(committee, { status: 201 });
  } catch (error) {
    console.error('POST committee error:', error);
    return NextResponse.json(
      { error: 'Failed to create committee' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const form = await req.formData();
    const text = form.get('text')?.toString() || '';
    const category = form.get('category')?.toString() || '';
    const file = form.get('file') as File | null;

    let filename: string | undefined;
    if (file && file.size > 0) {
      const result = await saveCommitteeFile(file);
      if (typeof result !== 'string') {
        return NextResponse.json(result, { status: 400 });
      }
      filename = result;
    }

    const updated = await prisma.stCommittee.update({
      where: { id },
      data: { text, category, ...(filename ? { filename } : {}) },
    });

    invalidate();
    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update committee' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.stCommittee.delete({ where: { id } });

    invalidate();
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete committee' },
      { status: 500 }
    );
  }
}
