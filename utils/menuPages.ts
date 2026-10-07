/**
 * Admin-managed menu pages. Pure helpers (no database / server imports) shared
 * by the public nav, the admin screens and the API validation.
 */

/** What the public navigation needs to render a menu entry (no content). */
export type CustomMenuPage = {
  id: number;
  title: string;
  slug: string;
  /** '' = standalone top-level link, else the id of a built-in dropdown. */
  parent: string;
  sortOrder: number;
};

/**
 * The dropdowns that already exist in the top navigation. Keep the ids in sync
 * with `navItems` in components/TopNavView.tsx. A page whose parent is not in
 * this list is shown as a standalone link rather than vanishing.
 */
export const BUILTIN_MENUS = [
  { id: 'about', label: 'Бидний тухай' },
  { id: 'news', label: 'Мэдээ мэдээлэл' },
  { id: 'law', label: 'Эрх зүй' },
  { id: 'report', label: 'Тайлан' },
  { id: 'dans', label: 'Шилэн данс' },
] as const;

export const MENU_LIMITS = {
  title: 100,
  slug: 80,
  content: 200_000,
  sortOrder: 9999,
} as const;

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const pageHref = (slug: string) => `/khuudas/${slug}`;

// Mongolian Cyrillic -> Latin, so a title like "Хөгжлийн бодлого" becomes a
// readable URL slug ("khugjliin-bodlogo") instead of percent-encoded text.
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z',
  и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', ө: 'u', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ү: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch',
  ш: 'sh', щ: 'sh', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(title: string): string {
  const latin = Array.from(title.toLowerCase())
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('');
  return latin
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MENU_LIMITS.slug)
    .replace(/-+$/g, '');
}

export function parentLabel(parent: string): string {
  return BUILTIN_MENUS.find((m) => m.id === parent)?.label ?? 'Үндсэн цэс (шууд холбоос)';
}

export type MenuPageInput = {
  title: string;
  slug: string;
  parent: string;
  content: string;
  sortOrder: number;
  published: boolean;
};

export type MenuPageValidation =
  | { ok: true; data: MenuPageInput }
  | { ok: false; error: string };

/** Validates and normalises untrusted input from the admin form. */
export function validateMenuPageInput(input: unknown): MenuPageValidation {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: 'Буруу хүсэлт байна.' };
  }
  const raw = input as Record<string, unknown>;
  const str = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : '');

  const title = str('title').trim();
  const slug = str('slug').trim().toLowerCase();
  const parent = str('parent').trim();
  const content = str('content');

  if (!title) return { ok: false, error: 'Цэсний нэрээ оруулна уу.' };
  if (title.length > MENU_LIMITS.title) {
    return { ok: false, error: `Цэсний нэр хэт урт байна (дээд тал нь ${MENU_LIMITS.title} тэмдэгт).` };
  }

  if (!slug) return { ok: false, error: 'Хаяг (URL) оруулна уу.' };
  if (slug.length > MENU_LIMITS.slug || !SLUG_RE.test(slug)) {
    return {
      ok: false,
      error: 'Хаяг нь зөвхөн жижиг латин үсэг, тоо, "-" агуулна (жишээ: hugjliin-bodlogo).',
    };
  }

  if (parent !== '' && !BUILTIN_MENUS.some((m) => m.id === parent)) {
    return { ok: false, error: 'Цэсний байршил буруу байна.' };
  }

  if (content.length > MENU_LIMITS.content) {
    return { ok: false, error: 'Агуулга хэт урт байна.' };
  }

  const order = raw.sortOrder === undefined || raw.sortOrder === '' ? 0 : Number(raw.sortOrder);
  if (!Number.isInteger(order) || Math.abs(order) > MENU_LIMITS.sortOrder) {
    return { ok: false, error: 'Дараалал нь бүхэл тоо байх ёстой.' };
  }

  return {
    ok: true,
    data: {
      title,
      slug,
      parent,
      content,
      sortOrder: order,
      published: raw.published === undefined ? true : raw.published === true,
    },
  };
}

const bySortThenId = (a: CustomMenuPage, b: CustomMenuPage) =>
  a.sortOrder - b.sortOrder || a.id - b.id;

/**
 * Splits pages into standalone top-level links and per-dropdown children, each
 * ordered by sortOrder then id. Unknown parents fall back to standalone.
 */
export function groupCustomPages(pages: CustomMenuPage[]): {
  standalone: CustomMenuPage[];
  byGroup: Record<string, CustomMenuPage[]>;
} {
  const standalone: CustomMenuPage[] = [];
  const byGroup: Record<string, CustomMenuPage[]> = {};

  for (const page of [...pages].sort(bySortThenId)) {
    if (BUILTIN_MENUS.some((m) => m.id === page.parent)) {
      (byGroup[page.parent] ??= []).push(page);
    } else {
      standalone.push(page);
    }
  }
  return { standalone, byGroup };
}
