import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from '@/utils/env';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = 2000;

type AnswerInput = { questionId?: unknown; answer?: unknown };

// Submissions are public (anyone can send feedback), but the listing below
// must stay admin-only. This route isn't in proxy.ts's PROTECTED_PATHS
// (that would also gate the public POST), so GET checks auth itself here,
// the same way app/api/auth/me/route.ts does.
async function isAdmin(): Promise<boolean> {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return false;
    await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const submissions = await prisma.feedbackSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(submissions);
  } catch {
    return NextResponse.json(
      { error: 'Error fetching submissions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

    if (!name || name.length > 200) {
      return NextResponse.json({ error: 'Нэрээ зөв оруулна уу' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Имэйл хаягаа зөв оруулна уу' }, { status: 400 });
    }
    if (!phone || phone.length > 30) {
      return NextResponse.json({ error: 'Утасны дугаараа зөв оруулна уу' }, { status: 400 });
    }

    // Two submission shapes share this endpoint: a plain-text "Санал хүсэлт"
    // (no topicId, just a message) or a "Судалгаа" survey (topicId + answers
    // keyed by question). Presence of topicId picks which one this is.
    if (body.topicId != null) {
      const topicId = Number(body.topicId);
      if (!Number.isFinite(topicId)) {
        return NextResponse.json({ error: 'Сэдэв сонгоно уу' }, { status: 400 });
      }

      const topic = await prisma.feedbackTopic.findUnique({ where: { id: topicId } });
      if (!topic) {
        return NextResponse.json({ error: 'Сэдэв олдсонгүй' }, { status: 404 });
      }

      const rawAnswers: AnswerInput[] = Array.isArray(body.answers) ? body.answers : [];
      const questionIds = rawAnswers
        .map((a) => Number(a.questionId))
        .filter((id) => Number.isFinite(id));

      const questions = questionIds.length
        ? await prisma.feedbackQuestion.findMany({
            where: { id: { in: questionIds }, topicId },
          })
        : [];
      const questionById = new Map(questions.map((q) => [q.id, q.text]));

      const answers = rawAnswers
        .map((a) => {
          const questionText = questionById.get(Number(a.questionId));
          const answerText = typeof a.answer === 'string' ? a.answer.trim() : '';
          if (!questionText || !answerText) return null;
          return { question: questionText, answer: answerText.slice(0, MAX_LEN) };
        })
        .filter((a): a is { question: string; answer: string } => a !== null);

      const submission = await prisma.feedbackSubmission.create({
        data: { topicTitle: topic.title, name, email, phone, answers },
      });

      return NextResponse.json(submission, { status: 201 });
    }

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return NextResponse.json({ error: 'Санал хүсэлтээ бичнэ үү' }, { status: 400 });
    }

    const submission = await prisma.feedbackSubmission.create({
      data: { name, email, phone, message: message.slice(0, MAX_LEN) },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Хүсэлт илгээхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
