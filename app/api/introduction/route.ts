import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/utils/prisma';
import { sanitizeHtml } from '@/utils/sanitize';

function invalidate() {
  revalidatePath('/taniltsuulga');
}

export async function GET() {
  try {
    const content = await prisma.introduction.findFirst();
    return NextResponse.json(content, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Error fetching content' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    const created = await prisma.introduction.create({
      data: { content: sanitizeHtml(content) },
    });

    invalidate();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error creating content' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { content } = await req.json();
    const clean = sanitizeHtml(content);

    const existing = await prisma.introduction.findFirst();

    if (existing) {
      const updated = await prisma.introduction.update({
        where: { id: existing.id },
        data: { content: clean },
      });

      invalidate();
      return NextResponse.json(updated, { status: 200 });
    }

    const created = await prisma.introduction.create({
      data: { content: clean },
    });

    invalidate();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error updating content' },
      { status: 500 }
    );
  }
}
