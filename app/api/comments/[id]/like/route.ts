import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comment = await prisma.comment.update({
    where: { id: Number(id) },
    data: { likes: { increment: 1 } },
  });
  return NextResponse.json(comment);
}
