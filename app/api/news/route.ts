import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { validateImage } from '@/utils/fileValidation';
import { saveUploadedFile } from '@/utils/uploadFile';
import { sanitizeHtml } from '@/utils/sanitize';

async function saveFile(file: File, folder: string) {
  return saveUploadedFile(file, folder, uuidv4());
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const item = await prisma.news.findUnique({
      where: { slug },
    });
    return NextResponse.json(item);
  }

  const list = await prisma.news.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const title = form.get('title')?.toString() || '';
    const category = form.get('category')?.toString() || '';
    const content = form.get('content')?.toString() || '';
    const date = form.get('date')?.toString() || '';
    const coverImage = form.get('coverImage') as File | null;

    const images = form.getAll('images') as File[];

    if (!title || !category || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    let coverPath = '';
    if (coverImage) {
      const err = validateImage(coverImage);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
      coverPath = await saveFile(coverImage, 'news');
    }

    const imagePaths: string[] = [];
    for (const img of images) {
      const err = validateImage(img);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
      const p = await saveFile(img, 'news');
      imagePaths.push(p);
    }

    const slug = uuidv4();
    const dateObj = date ? new Date(date) : new Date();

    const item = await prisma.news.create({
      data: {
        title,
        category,
        content: sanitizeHtml(content),
        coverImage: coverPath,
        images: imagePaths,
        slug,
        date: dateObj,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err: unknown) {
    console.error('POST news error:', err);
    return NextResponse.json({ error: 'Error creating news' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    await prisma.news.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
export async function PUT(req: Request) {
  try {
    const form = await req.formData();

    const id = Number(form.get('id'));
    const title = form.get('title')?.toString() || '';
    const category = form.get('category')?.toString() || '';
    const content = form.get('content')?.toString() || '';
    const date = form.get('date')?.toString() || '';

    const coverImage = form.get('coverImage') as File | null;

    const newImages = form.getAll('images') as File[];
    const deleteImages = form.getAll('deleteImages') as string[];

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let coverPath = existing.coverImage;

    if (coverImage) {
      const err = validateImage(coverImage);
      if (err) return NextResponse.json({ error: err }, { status: 400 });

      coverPath = await saveFile(coverImage, 'news');
    }

    let updatedImages = existing.images;

    if (deleteImages.length > 0) {
      updatedImages = updatedImages.filter(
        (img: string) => !deleteImages.includes(img)
      );

      for (const imgPath of deleteImages) {
        const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
        const rel = imgPath.replace(/^\/uploads\//, '');
        await unlink(path.join(uploadDir, rel)).catch(() => {});
      }
    }

    for (const img of newImages) {
      const err = validateImage(img);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
      const p = await saveFile(img, 'news');
      updatedImages.push(p);
    }

    const dateObj = date ? new Date(date) : existing.date;

    const updated = await prisma.news.update({
      where: { id },
      data: {
        title,
        category,
        content: sanitizeHtml(content),
        coverImage: coverPath,
        images: updatedImages,
        date: dateObj,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err: unknown) {
    console.error('PUT news error:', err);
    return NextResponse.json({ error: 'Error updating news' }, { status: 500 });
  }
}
