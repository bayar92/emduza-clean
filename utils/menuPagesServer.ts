import { prisma } from '@/utils/prisma';
import type { CustomMenuPage, MenuKind } from '@/utils/menuPages';

let loggedFailure = false;

/**
 * Published menu entries for the navigation bar (no content). Never throws:
 * if the database or the MenuPage table (before the migration is applied) is
 * unavailable the nav simply shows only its built-in items.
 */
export async function getMenuPages(): Promise<CustomMenuPage[]> {
  try {
    const rows = await prisma.menuPage.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        title: true,
        kind: true,
        slug: true,
        parent: true,
        parentId: true,
        sortOrder: true,
      },
    });
    return rows.map((r) => ({ ...r, kind: r.kind as MenuKind }));
  } catch (err) {
    // Every page render calls this, so log once instead of flooding the logs.
    if (!loggedFailure) {
      loggedFailure = true;
      console.error('getMenuPages failed, nav shows built-in items only:', err);
    }
    return [];
  }
}

/** A published *page* (not a group) by slug for the public route, or null. May throw on DB errors. */
export async function getPublishedPage(slug: string) {
  const page = await prisma.menuPage.findUnique({ where: { slug } });
  return page && page.kind === 'page' && page.published ? page : null;
}
