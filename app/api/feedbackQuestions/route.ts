import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';
import { sanitizeHtml } from '@/utils/sanitize';

const VALID_TYPES = new Set([
  'TEXT',
  'YES_NO',
  'MULTIPLE_CHOICE',
  'MULTIPLE_CHOICE_FOLLOWUP',
]);

function sanitizeOptions(options: unknown): string[] | undefined {
  if (!Array.isArray(options)) return undefined;
  return options
    .filter((o): o is string => typeof o === 'string' && o.trim().length > 0)
    .map((o) => sanitizeHtml(o.trim()));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = Number(searchParams.get('topicId'));

    const questions = await prisma.feedbackQuestion.findMany({
      where: topicId ? { topicId } : undefined,
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(questions);
  } catch {
    return NextResponse.json(
      { error: 'Error fetching questions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { topicId, parentId, triggerValue, type, text, options, order } =
      await req.json();

    if (!Number.isFinite(Number(topicId))) {
      return NextResponse.json({ error: 'Сэдэв сонгоно уу' }, { status: 400 });
    }
    if (typeof text !== 'string') {
      return NextResponse.json({ error: 'Асуултын текст буруу байна' }, { status: 400 });
    }
    const questionType = VALID_TYPES.has(type) ? type : 'TEXT';

    const question = await prisma.feedbackQuestion.create({
      data: {
        topicId: Number(topicId),
        parentId: Number.isFinite(Number(parentId)) ? Number(parentId) : null,
        triggerValue: typeof triggerValue === 'string' ? triggerValue : null,
        type: questionType,
        text: sanitizeHtml(text),
        options: sanitizeOptions(options) ?? undefined,
        order: Number.isFinite(order) ? Number(order) : 0,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error creating question' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    const { text, type, options, order } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const question = await prisma.feedbackQuestion.update({
      where: { id },
      data: {
        ...(typeof text === 'string' ? { text: sanitizeHtml(text) } : {}),
        ...(VALID_TYPES.has(type) ? { type } : {}),
        ...(sanitizeOptions(options) ? { options: sanitizeOptions(options) } : {}),
        ...(Number.isFinite(order) ? { order: Number(order) } : {}),
      },
    });

    return NextResponse.json(question);
  } catch {
    return NextResponse.json(
      { error: 'Error updating question' },
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

    await prisma.feedbackQuestion.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: 'Error deleting question' },
      { status: 500 }
    );
  }
}
