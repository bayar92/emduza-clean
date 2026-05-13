import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const newsId = Number(searchParams.get('newsId'));

  if (!newsId) {
    return NextResponse.json({ error: 'newsId required' }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { newsId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(comments);
}

export async function POST(req: Request) {
  const { name, content, newsId } = await req.json();

  if (!name || !content || !newsId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { name, content, newsId: Number(newsId) },
  });

  return NextResponse.json(comment, { status: 201 });
}
