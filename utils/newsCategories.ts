/**
 * News categories — the single place that defines the category names.
 *
 * A news item stores its category as plain text, and the public pages find it
 * again by comparing that text. The admin form used to save "Хяналт үнэлгээ"
 * and "ЭМДҮЗ-ийн хуралдаан" while the pages searched for "Хяналт, үнэлгээний
 * талаар" and "ЭМДҮЗ-ийн хуралдаан, хуралдааны тойм", so news added through
 * the form never showed up on its own sub-menu page. Everything (the form, the
 * category pages, the home-page tabs, the badge colours) now uses the values
 * below, and the old spellings still stored in the database are recognised.
 */

export const CATEGORY_HURALDAAN = 'ЭМДҮЗ-ийн хуралдаан, хуралдааны тойм';
export const CATEGORY_TEKHNIK = 'Техникийн хорооны мэдээлэл';
export const CATEGORY_HYNALT = 'Хяналт, үнэлгээний талаар';

/** Spellings the admin form saved before the names were unified -> the real value. */
const LEGACY_ALIASES: Record<string, string> = {
  'ЭМДҮЗ-ийн хуралдаан': CATEGORY_HURALDAAN,
  'Хяналт үнэлгээ': CATEGORY_HYNALT,
};

/** Choices offered by the news form. `value` is exactly what gets stored. */
export const NEWS_CATEGORY_OPTIONS = [
  { value: 'Мэдээлэл', label: 'Мэдээлэл' },
  { value: 'Онцлох мэдээ', label: 'Онцлох мэдээ' },
  { value: CATEGORY_HURALDAAN, label: 'ЭМДҮЗ-ийн хуралдаан, хуралдааны тойм' },
  { value: CATEGORY_TEKHNIK, label: 'Техникийн хорооны мэдээлэл' },
  { value: CATEGORY_HYNALT, label: 'Хяналт, үнэлгээний талаар' },
] as const;

/** Maps an old spelling to the current value; anything else is returned unchanged. */
export function normalizeCategory(raw: string): string {
  return LEGACY_ALIASES[raw] ?? raw;
}

/** Do two stored categories mean the same thing (ignoring old spellings)? */
export function sameCategory(a: string, b: string): boolean {
  return normalizeCategory(a) === normalizeCategory(b);
}

/**
 * Every spelling that may be stored for `category`: the current value first,
 * then the old ones. For database filters (`where: { category: { in: ... } }`)
 * so news saved under an old name is still found.
 */
export function categoryValues(category: string): string[] {
  const current = normalizeCategory(category);
  return [
    current,
    ...Object.entries(LEGACY_ALIASES)
      .filter(([, value]) => value === current)
      .map(([alias]) => alias),
  ];
}
