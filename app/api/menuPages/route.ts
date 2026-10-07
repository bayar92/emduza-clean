import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/utils/prisma';
import { isAdminRequest } from '@/utils/requireAdmin';
import { sanitizeHtml } from '@/utils/sanitize';
import { validateMenuPageInput, validatePlacement, type TreeRow } from '@/utils/menuPages';
import { getMenuPages } from '@/utils/menuPagesServer';

const SLUG_TAKEN = 'Энэ хаяг (URL) аль хэдийн ашиглагдаж байна. Өөр хаяг сонгоно уу.';

/**
 * Public: published menu entries for the navigation (no content).
 * `?all=1` (admin only) also returns drafts, for the management list.
 */
export async function GET(req: Request) {
  const wantsAll = new URL(req.url).searchParams.get('all') === '1';

  if (!wantsAll) {
    return NextResponse.json(await getMenuPages());
  }

  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pages = await prisma.menuPage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        title: true,
        kind: true,
        slug: true,
        parent: true,
        parentId: true,
        sortOrder: true,
        published: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(pages);
  } catch (err) {
    console.error('GET menuPages (all) error:', err);
    return NextResponse.json({ error: 'Мэдээлэл татахад алдаа гарлаа' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    const placementError = validatePlacement(rows, {
      kind: data.kind,
      parent: data.parent,
      parentId: data.parentId,
    });
    if (placementError) {
      return NextResponse.json({ error: placementError }, { status: 400 });
    }

    const created = await prisma.menuPage.create({
      data: { ...data, content: sanitizeHtml(data.content) },
    });
    // The nav is on every public page.
    revalidatePath('/', 'layout');
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if ((err as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: SLUG_TAKEN }, { status: 409 });
    }
    console.error('POST menuPages error:', err);
    return NextResponse.json({ error: 'Хадгалахад алдаа гарлаа' }, { status: 500 });
  }
}
