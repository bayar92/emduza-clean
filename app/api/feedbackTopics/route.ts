import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';
import { sanitizeHtml } from '@/utils/sanitize';

export async function GET() {
  try {
    const topics = await prisma.feedbackTopic.findMany({
      orderBy: { createdAt: 'asc' },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    return NextResponse.json(topics);
  } catch {
    return NextResponse.json(
      { error: 'Error fetching topics' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Сэдвийн нэр шаардлагатай' }, { status: 400 });
    }

    const topic = await prisma.feedbackTopic.create({
      data: { title: sanitizeHtml(title) },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error creating topic' },
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

    await prisma.feedbackTopic.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: 'Error deleting topic' },
      { status: 500 }
    );
  }
}
