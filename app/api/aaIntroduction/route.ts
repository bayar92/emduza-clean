import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/utils/prisma';
import { sanitizeHtml } from '@/utils/sanitize';

function invalidate() {
  revalidatePath('/ajliin-alba-taniltsuulga');
}

export async function GET() {
  try {
    const content = await prisma.aaIntroduction.findFirst();
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

    const newContent = await prisma.aaIntroduction.create({
      data: { content: sanitizeHtml(content) },
    });

    invalidate();
    return NextResponse.json(newContent, { status: 201 });
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

    const existing = await prisma.aaIntroduction.findFirst();

    if (existing) {
      const updated = await prisma.aaIntroduction.update({
        where: { id: existing.id },
        data: { content: clean },
      });
      invalidate();
      return NextResponse.json(updated, { status: 200 });
    }

    const newContent = await prisma.aaIntroduction.create({
      data: { content: clean },
    });

    invalidate();
    return NextResponse.json(newContent, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error updating content' },
      { status: 500 }
    );
  }
}
