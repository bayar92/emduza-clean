import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/utils/prisma';
import { isAdminRequest } from '@/utils/requireAdmin';
import { sanitizeHtml } from '@/utils/sanitize';
import { validateMenuPageInput } from '@/utils/menuPages';

const SLUG_TAKEN = 'Энэ хаяг (URL) аль хэдийн ашиглагдаж байна. Өөр хаяг сонгоно уу.';

type Ctx = { params: Promise<{ id: string }> };

async function parseId(ctx: Ctx): Promise<number | null> {
  const { id } = await ctx.params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const notFound = () => NextResponse.json({ error: 'Олдсонгүй' }, { status: 404 });

/** Admin only: a full record (incl. drafts and content) for the edit form. */
export async function GET(req: Request, ctx: Ctx) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = await parseId(ctx);
  if (!id) return notFound();

  try {
    const page = await prisma.menuPage.findUnique({ where: { id } });
    return page ? NextResponse.json(page) : notFound();
  } catch (err) {
    console.error('GET menuPages/[id] error:', err);
    return NextResponse.json({ error: 'Мэдээлэл татахад алдаа гарлаа' }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = await parseId(ctx);
  if (!id) return notFound();

  const body = await req.json().catch(() => null);
  const parsed = validateMenuPageInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const updated = await prisma.menuPage.update({
      where: { id },
      data: { ...parsed.data, content: sanitizeHtml(parsed.data.content) },
    });
    revalidatePath('/', 'layout');
    return NextResponse.json(updated);
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === 'P2002') {
      return NextResponse.json({ error: SLUG_TAKEN }, { status: 409 });
    }
    if (code === 'P2025') return notFound();
    console.error('PUT menuPages/[id] error:', err);
    return NextResponse.json({ error: 'Хадгалахад алдаа гарлаа' }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const id = await parseId(ctx);
  if (!id) return notFound();

  try {
    await prisma.menuPage.delete({ where: { id } });
    revalidatePath('/', 'layout');
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if ((err as { code?: string })?.code === 'P2025') return notFound();
    console.error('DELETE menuPages/[id] error:', err);
    return NextResponse.json({ error: 'Устгахад алдаа гарлаа' }, { status: 500 });
  }
}
