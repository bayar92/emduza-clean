import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/utils/prisma';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { validateVideoAsync } from '@/utils/fileValidation';
import { saveUploadedFile } from '@/utils/uploadFile';

function invalidateVideos() {
  revalidatePath('/');
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);
    const offset = (page - 1) * limit;

    const videos = await prisma.video.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const totalVideos = await prisma.video.count();

    return NextResponse.json({ videos, totalVideos });
  } catch {
    return NextResponse.json(
      { error: 'Error fetching videos' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const title = form.get('title')?.toString() ?? '';
    const video = form.get('video') as File | null;

    if (!title || !video) {
      return NextResponse.json(
        { error: 'Missing title or video' },
        { status: 400 }
      );
    }

    const validationError = await validateVideoAsync(video);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const savedPath = await saveUploadedFile(video, "video", uuidv4());

    const newVideo = await prisma.video.create({
      data: { title, videoPath: savedPath },
    });

    invalidateVideos();
    return NextResponse.json(newVideo, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error uploading video' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const existing = await prisma.video.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    await prisma.video.delete({ where: { id } });

    if (existing.videoPath) {
      // videoPath is like /uploads/video/filename or /video/filename
      const rel = existing.videoPath.replace(/^\/uploads\//, '').replace(/^\//, '');
      const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadDir, rel);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    invalidateVideos();
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: 'Error deleting video' },
      { status: 500 }
    );
  }
}
