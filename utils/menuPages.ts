/**
 * Admin-managed navigation menu. Pure helpers (no database / server imports)
 * shared by the public nav, the admin screens and the API validation.
 *
 * An entry is either a "page" (has content, lives at /khuudas/<slug>) or a
 * "group" (a dropdown that holds other entries). Entries nest up to
 * MAX_MENU_DEPTH levels. The built-in dropdowns and the built-in links inside
 * them count too, so an entry can be placed:
 *
 *   level 1  top-level entry in the nav bar        | a built-in dropdown
 *   level 2  inside a built-in dropdown            | a built-in link (e.g. "Ажлын алба")
 *   level 3  inside a built-in link, or a sub-menu of a level-1/2 group
 *   level 4  the deepest level (pages only)
 */

export type MenuKind = 'page' | 'group';

/** What the public navigation needs to render an entry (no content). */
export type CustomMenuPage = {
  id: number;
  title: string;
  kind: MenuKind;
  /** null for groups. */
  slug: string | null;
  /** '' or the id of a built-in dropdown. Mutually exclusive with parentId. */
  parent: string;
  /** id of the group this entry sits in, or null. */
  parentId: number | null;
  sortOrder: number;
};

/** A row in the admin list (includes drafts). */
export type AdminMenuRow = CustomMenuPage & {
  published: boolean;
  updatedAt?: string;
};

/**
 * The dropdowns that already exist in the top navigation. Keep the ids in sync
 * with `navItems` in components/TopNavView.tsx. An entry whose built-in parent
 * is not in this list is shown as a top-level entry rather than vanishing.
 */
export const BUILTIN_MENUS = [
  { id: 'about', label: 'Бидний тухай' },
  { id: 'news', label: 'Мэдээ мэдээлэл' },
  { id: 'law', label: 'Эрх зүй' },
  { id: 'report', label: 'Тайлан' },
  { id: 'dans', label: 'Шилэн данс' },
] as const;

/**
 * The links inside the built-in dropdowns that an admin can hang entries from
 * (the external "Шилэн данс" links are excluded). `id` is "<menu>.<name>".
 * Keep ids, labels and hrefs in sync with `navItems` in
 * components/TopNavView.tsx (a unit test enforces this).
 */
export const BUILTIN_ITEMS = [
  { id: 'about.taniltsuulga', menu: 'about', label: 'ЭМДҮЗ танилцуулга', href: '/taniltsuulga' },
  { id: 'about.mendchilgee', menu: 'about', label: 'Даргын мэндчилгээ', href: '/mendchilgee' },
  { id: 'about.gishuud', menu: 'about', label: 'ЭМДҮЗ-ийн гишүүд', href: '/gishuud' },
  { id: 'about.alba', menu: 'about', label: 'Ажлын алба', href: '/ajliin-alba-taniltsuulga' },
  { id: 'news.huraldaan', menu: 'news', label: 'Хуралдааны тойм', href: '/medee/huraldaanii-toim' },
  { id: 'news.tekhnik', menu: 'news', label: 'Техникийн хороо', href: '/medee/technikiin-khoroo' },
  { id: 'news.hynalt', menu: 'news', label: 'Хяналт, үнэлгээ', href: '/medee/hynalt-unelgee' },
  { id: 'law.shiidwer', menu: 'law', label: 'УИХ, Байнгын хорооны шийдвэр', href: '/erkhzui/shiidwer' },
  { id: 'law.togtool', menu: 'law', label: 'Засгийн газрын тогтоол', href: '/erkhzui/togtool' },
  { id: 'law.emduz-togtool', menu: 'law', label: 'ЭМДҮЗ-ийн тогтоолууд', href: '/erkhzui/emduz-togtool' },
  { id: 'report.sankhuu', menu: 'report', label: 'ЭМД-ын сангийн санхүүгийн тайлан', href: '/taillan/sankhuu' },
  { id: 'report.uil-ajillagaa', menu: 'report', label: 'ЭМДҮЗ-ийн үйл ажиллагааны тайлан', href: '/taillan/uil-ajillagaa' },
] as const;

export type BuiltinParent = {
  /** The built-in dropdown this key belongs to. */
  menuId: string;
  menuLabel: string;
  /** Set when the key is a link inside the dropdown (e.g. "Ажлын алба"). */
  itemLabel?: string;
  /** Level an entry placed directly inside it ends up at. */
  childDepth: number;
};

/** Resolves a `parent` value: a built-in dropdown id or a built-in item id. */
export function resolveBuiltinParent(key: string): BuiltinParent | null {
  const menu = BUILTIN_MENUS.find((m) => m.id === key);
  if (menu) return { menuId: menu.id, menuLabel: menu.label, childDepth: 2 };
  const item = BUILTIN_ITEMS.find((i) => i.id === key);
  if (item) {
    const m = BUILTIN_MENUS.find((x) => x.id === item.menu)!;
    return { menuId: m.id, menuLabel: m.label, itemLabel: item.label, childDepth: 3 };
  }
  return null;
}

export const isBuiltinParent = (key: string) => resolveBuiltinParent(key) !== null;

export const MAX_MENU_DEPTH = 4;

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
  const r = resolveBuiltinParent(parent);
  if (!r) return 'Үндсэн цэс';
  return r.itemLabel ? `${r.menuLabel} › ${r.itemLabel}` : r.menuLabel;
}

/* ─── Validating one entry's own fields ──────────────────────────────────── */

export type MenuPageInput = {
  title: string;
  kind: MenuKind;
  slug: string | null;
  parent: string;
  parentId: number | null;
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

  if (raw.kind !== undefined && raw.kind !== 'page' && raw.kind !== 'group') {
    return { ok: false, error: 'Цэсний төрөл буруу байна.' };
  }
  const kind: MenuKind = raw.kind === 'group' ? 'group' : 'page';

  const title = str('title').trim();
  const parent = str('parent').trim();

  if (!title) return { ok: false, error: 'Цэсний нэрээ оруулна уу.' };
  if (title.length > MENU_LIMITS.title) {
    return { ok: false, error: `Цэсний нэр хэт урт байна (дээд тал нь ${MENU_LIMITS.title} тэмдэгт).` };
  }

  if (parent !== '' && !isBuiltinParent(parent)) {
    return { ok: false, error: 'Цэсний байршил буруу байна.' };
  }

  let parentId: number | null = null;
  if (raw.parentId !== undefined && raw.parentId !== null && raw.parentId !== '') {
    const n = Number(raw.parentId);
    if (!Number.isInteger(n) || n < 1) {
      return { ok: false, error: 'Цэсний байршил буруу байна.' };
    }
    parentId = n;
  }
  if (parentId !== null && parent !== '') {
    return { ok: false, error: 'Нэг дор хоёр байршил сонгох боломжгүй.' };
  }

  const order = raw.sortOrder === undefined || raw.sortOrder === '' ? 0 : Number(raw.sortOrder);
  if (!Number.isInteger(order) || Math.abs(order) > MENU_LIMITS.sortOrder) {
    return { ok: false, error: 'Дараалал нь бүхэл тоо байх ёстой.' };
  }
  const published = raw.published === undefined ? true : raw.published === true;

  // A group is only a dropdown: no page, so no URL and no content.
  if (kind === 'group') {
    return {
      ok: true,
      data: { title, kind, slug: null, parent, parentId, content: '', sortOrder: order, published },
    };
  }

  const slug = str('slug').trim().toLowerCase();
  const content = str('content');

  if (!slug) return { ok: false, error: 'Хаяг (URL) оруулна уу.' };
  if (slug.length > MENU_LIMITS.slug || !SLUG_RE.test(slug)) {
    return {
      ok: false,
      error: 'Хаяг нь зөвхөн жижиг латин үсэг, тоо, "-" агуулна (жишээ: hugjliin-bodlogo).',
    };
  }
  if (content.length > MENU_LIMITS.content) {
    return { ok: false, error: 'Агуулга хэт урт байна.' };
  }

  return {
    ok: true,
    data: { title, kind, slug, parent, parentId, content, sortOrder: order, published },
  };
}

/* ─── Structure checks (need the existing rows) ──────────────────────────── */

export type TreeRow = {
  id: number;
  kind: MenuKind;
  parent: string;
  parentId: number | null;
};

const byIdMap = <T extends { id: number }>(rows: T[]) =>
  new Map(rows.map((r) => [r.id, r] as const));

/** Level of an entry with no group above it: 1 top-level, 2 in a built-in dropdown, 3 in a built-in link. */
const baseDepth = (parent: string) => (parent ? resolveBuiltinParent(parent)?.childDepth ?? 1 : 1);

/** Level of an entry: 1 = top-level, deeper for every dropdown / sub-menu above it. */
export function depthOf(rows: TreeRow[], id: number): number {
  const byId = byIdMap(rows);
  let depth = 0;
  let cur = byId.get(id);
  const seen = new Set<number>();
  while (cur) {
    if (seen.has(cur.id)) return Number.MAX_SAFE_INTEGER; // corrupt data: a cycle
    seen.add(cur.id);
    if (cur.parentId === null) return depth + baseDepth(cur.parent);
    depth += 1;
    cur = byId.get(cur.parentId);
  }
  return depth + 1;
}

/** Longest chain of entries below `id` (0 when it has no children). */
export function descendantDepth(rows: TreeRow[], id: number): number {
  const kids = new Map<number, TreeRow[]>();
  for (const r of rows) {
    if (r.parentId !== null) (kids.get(r.parentId) ?? kids.set(r.parentId, []).get(r.parentId)!).push(r);
  }
  const walk = (node: number, seen: Set<number>): number => {
    if (seen.has(node)) return 0;
    seen.add(node);
    let best = 0;
    for (const c of kids.get(node) ?? []) best = Math.max(best, 1 + walk(c.id, seen));
    return best;
  };
  return walk(id, new Set());
}

export type Placement = {
  /** Undefined while creating. */
  id?: number;
  kind: MenuKind;
  parent: string;
  parentId: number | null;
};

/**
 * Checks that putting an entry at this placement keeps the tree valid: the
 * parent exists and is a group, nothing is moved inside itself, and no branch
 * gets deeper than MAX_MENU_DEPTH. Returns a message, or null when fine.
 */
export function validatePlacement(rows: TreeRow[], p: Placement): string | null {
  let depth: number;

  if (p.parentId !== null) {
    const byId = byIdMap(rows);
    const par = byId.get(p.parentId);
    if (!par) return 'Сонгосон цэс олдсонгүй.';
    if (par.kind !== 'group') return 'Дэд цэс зөвхөн цэс (бүлэг) дотор орно.';

    if (p.id !== undefined) {
      if (par.id === p.id) return 'Цэсийг өөрийнх нь дотор байрлуулах боломжгүй.';
      const seen = new Set<number>();
      let cur: TreeRow | undefined = par;
      while (cur && cur.parentId !== null && !seen.has(cur.id)) {
        if (cur.parentId === p.id) {
          return 'Цэсийг өөрийнх нь дэд цэсийн дотор байрлуулах боломжгүй.';
        }
        seen.add(cur.id);
        cur = byId.get(cur.parentId);
      }
    }
    depth = depthOf(rows, par.id) + 1;
  } else {
    depth = baseDepth(p.parent);
  }

  const below = p.id !== undefined ? descendantDepth(rows, p.id) : 0;
  if (depth + below > MAX_MENU_DEPTH) {
    return `Цэс хамгийн ихдээ ${MAX_MENU_DEPTH} түвшинтэй байна.`;
  }
  if (p.kind === 'group' && depth >= MAX_MENU_DEPTH) {
    return 'Энэ түвшинд дэд цэс үүсгэх боломжгүй. Түүний оронд хуудас нэмнэ үү.';
  }
  return null;
}

/* ─── The public navigation tree ─────────────────────────────────────────── */

export type MenuNode = {
  id: number;
  title: string;
  kind: MenuKind;
  slug: string | null;
  sortOrder: number;
  children: MenuNode[];
};

const bySortThenId = (a: { sortOrder: number; id: number }, b: { sortOrder: number; id: number }) =>
  a.sortOrder - b.sortOrder || a.id - b.id;

/**
 * Turns the flat list of published entries into the tree the nav renders:
 * entries inside a built-in dropdown or built-in link (keyed by that dropdown /
 * item id), and the top-level entries. Siblings are
 * ordered by sortOrder then id. Groups with nothing visible inside are dropped,
 * and so is anything whose group is missing (e.g. an unpublished group hides
 * its whole branch).
 */
export function buildMenuTree(pages: CustomMenuPage[]): {
  topLevel: MenuNode[];
  byBuiltin: Record<string, MenuNode[]>;
} {
  const ids = new Set(pages.map((p) => p.id));
  const kids = new Map<number, CustomMenuPage[]>();
  const roots: CustomMenuPage[] = [];

  for (const p of [...pages].sort(bySortThenId)) {
    if (p.parentId !== null) {
      if (!ids.has(p.parentId)) continue; // parent hidden or missing
      (kids.get(p.parentId) ?? kids.set(p.parentId, []).get(p.parentId)!).push(p);
    } else {
      roots.push(p);
    }
  }

  const toNode = (p: CustomMenuPage): MenuNode | null => {
    if (p.kind === 'page' && !p.slug) return null;
    const children = (kids.get(p.id) ?? [])
      .map(toNode)
      .filter((n): n is MenuNode => n !== null);
    if (p.kind === 'group' && children.length === 0) return null;
    return { id: p.id, title: p.title, kind: p.kind, slug: p.slug, sortOrder: p.sortOrder, children };
  };

  const topLevel: MenuNode[] = [];
  const byBuiltin: Record<string, MenuNode[]> = {};
  for (const root of roots) {
    const node = toNode(root);
    if (!node) continue;
    if (isBuiltinParent(root.parent)) {
      (byBuiltin[root.parent] ??= []).push(node);
    } else {
      topLevel.push(node);
    }
  }
  return { topLevel, byBuiltin };
}

/* ─── Admin helpers ──────────────────────────────────────────────────────── */

/** Placement <select> values: "" top-level, "b:<builtinId>", "c:<groupId>". */
export function encodePlacement(parent: string, parentId: number | null): string {
  if (parentId !== null) return `c:${parentId}`;
  return parent ? `b:${parent}` : '';
}

export function decodePlacement(value: string): { parent: string; parentId: number | null } {
  if (value.startsWith('b:')) return { parent: value.slice(2), parentId: null };
  if (value.startsWith('c:')) {
    const n = Number(value.slice(2));
    if (Number.isInteger(n) && n > 0) return { parent: '', parentId: n };
  }
  return { parent: '', parentId: null };
}

/** Groups from the root down to (and including) `parentId`, plus the built-in dropdown at the root. */
export function ancestorInfo(
  rows: AdminMenuRow[],
  parentId: number | null
): { chain: { id: number; title: string }[]; rootBuiltin: string } {
  const byId = byIdMap(rows);
  const chain: { id: number; title: string }[] = [];
  const seen = new Set<number>();
  let cur = parentId === null ? undefined : byId.get(parentId);
  let rootBuiltin = '';
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    chain.unshift({ id: cur.id, title: cur.title });
    rootBuiltin = cur.parentId === null ? cur.parent : rootBuiltin;
    cur = cur.parentId === null ? undefined : byId.get(cur.parentId);
  }
  return { chain, rootBuiltin };
}

export type PlacementOption = { value: string; label: string };

/**
 * Where a new/edited entry may be placed: the top level, each built-in
 * dropdown, and every group that still has room for it. The entry being edited
 * (and everything inside it) is excluded so it cannot be moved into itself.
 */
export function buildPlacementOptions(
  rows: AdminMenuRow[],
  opts: { kind: MenuKind; excludeId?: number }
): PlacementOption[] {
  const roomDepth = opts.kind === 'group' ? MAX_MENU_DEPTH - 1 : MAX_MENU_DEPTH;
  const options: PlacementOption[] = [
    {
      value: '',
      label: opts.kind === 'group' ? 'Үндсэн цэс (шинэ dropdown цэс)' : 'Үндсэн цэс (шууд холбоос)',
    },
    // Each built-in dropdown, followed by the built-in links inside it.
    ...BUILTIN_MENUS.flatMap((m) => [
      { value: `b:${m.id}`, label: `«${m.label}» цэсний дотор` },
      ...BUILTIN_ITEMS.filter((i) => i.menu === m.id).map((i) => ({
        value: `b:${i.id}`,
        label: `«${m.label} › ${i.label}» цэсний дотор`,
      })),
    ]).filter((o) => (resolveBuiltinParent(o.value.slice(2))?.childDepth ?? 1) <= roomDepth),
  ];

  const excluded = new Set<number>();
  if (opts.excludeId !== undefined) {
    const stack = [opts.excludeId];
    while (stack.length) {
      const id = stack.pop()!;
      if (excluded.has(id)) continue;
      excluded.add(id);
      for (const r of rows) if (r.parentId === id) stack.push(r.id);
    }
  }

  // Full path of a group, e.g. ["Эрх зүй", "Тайлан", "Жилийн"] (built-in dropdown first).
  const pathOf = (g: AdminMenuRow) => {
    const { chain, rootBuiltin } = ancestorInfo(rows, g.id);
    const names = chain.map((c) => c.title);
    if (rootBuiltin) names.unshift(parentLabel(rootBuiltin));
    return names;
  };

  // Sorted by path so a group always comes right before the groups inside it.
  const groups = rows
    .filter((r) => r.kind === 'group' && !excluded.has(r.id))
    .filter((g) => depthOf(rows, g.id) + 1 <= roomDepth)
    .map((g) => ({ g, path: pathOf(g) }))
    .sort((a, b) => a.path.join(' › ').localeCompare(b.path.join(' › '), 'mn'));

  for (const { g, path } of groups) {
    options.push({ value: `c:${g.id}`, label: `«${path.join(' › ')}» цэсний дотор` });
  }
  return options;
}

export type AdminNode = AdminMenuRow & { children: AdminNode[] };
export type AdminSection = { key: string; label: string; nodes: AdminNode[] };

/** The admin list: entries (drafts included) grouped by where they hang from. */
export function buildAdminSections(rows: AdminMenuRow[]): AdminSection[] {
  const kids = new Map<number, AdminMenuRow[]>();
  const roots: AdminMenuRow[] = [];
  for (const r of [...rows].sort(bySortThenId)) {
    if (r.parentId !== null) (kids.get(r.parentId) ?? kids.set(r.parentId, []).get(r.parentId)!).push(r);
    else roots.push(r);
  }

  const toNode = (r: AdminMenuRow): AdminNode => ({
    ...r,
    children: (kids.get(r.id) ?? []).map(toNode),
  });

  const sectionOf = (r: AdminMenuRow) => (isBuiltinParent(r.parent) ? r.parent : '');

  const sections: AdminSection[] = [
    { key: '', label: 'Үндсэн цэс', nodes: [] },
    ...BUILTIN_MENUS.flatMap((m) => [
      { key: m.id as string, label: `«${m.label}» цэсний дотор`, nodes: [] as AdminNode[] },
      ...BUILTIN_ITEMS.filter((i) => i.menu === m.id).map((i) => ({
        key: i.id as string,
        label: `«${m.label} › ${i.label}» цэсний дотор`,
        nodes: [] as AdminNode[],
      })),
    ]),
  ];
  for (const r of roots) sections.find((s) => s.key === sectionOf(r))!.nodes.push(toNode(r));
  return sections.filter((s) => s.nodes.length > 0);
}
