import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/utils/prisma';
import { isAdminRequest } from '@/utils/requireAdmin';
import { sanitizeHtml } from '@/utils/sanitize';
import { validateMenuPageInput, validatePlacement, type TreeRow } from '@/utils/menuPages';

const SLUG_TAKEN = 'Энэ хаяг (URL) аль хэдийн ашиглагдаж байна. Өөр хаяг сонгоно уу.';
const HAS_CHILDREN =
  'Энэ цэсийн дотор дэд цэс байна. Эхлээд тэдгээрийг устгах эсвэл өөр цэс рүү зөөнө үү.';

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
  const { data } = parsed;

  try {
    const rows = (await prisma.menuPage.findMany({
      select: { id: true, kind: true, parent: true, parentId: true },
    })) as TreeRow[];

    const existing = rows.find((r) => r.id === id);
    if (!existing) return notFound();
    // A page cannot hold entries and a group has no content, so the type is fixed.
    if (existing.kind !== data.kind) {
      return NextResponse.json({ error: 'Цэсний төрлийг өөрчлөх боломжгүй.' }, { status: 400 });
    }

    const placementError = validatePlacement(rows, {
      id,
      kind: data.kind,
      parent: data.parent,
      parentId: data.parentId,
    });
    if (placementError) {
      return NextResponse.json({ error: placementError }, { status: 400 });
    }

    const updated = await prisma.menuPage.update({
      where: { id },
      data: { ...data, content: sanitizeHtml(data.content) },
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
    // Deleting a group would orphan (or silently destroy) what is inside it.
    if ((await prisma.menuPage.count({ where: { parentId: id } })) > 0) {
      return NextResponse.json({ error: HAS_CHILDREN }, { status: 409 });
    }
    await prisma.menuPage.delete({ where: { id } });
    revalidatePath('/', 'layout');
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === 'P2025') return notFound();
    // Foreign-key guard: something was added to the group after the count above.
    if (code === 'P2003') return NextResponse.json({ error: HAS_CHILDREN }, { status: 409 });
    console.error('DELETE menuPages/[id] error:', err);
    return NextResponse.json({ error: 'Устгахад алдаа гарлаа' }, { status: 500 });
  }
}
