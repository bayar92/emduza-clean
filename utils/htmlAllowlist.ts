/**
 * Single source of truth for which HTML the rich-text editor may produce.
 * Pure constants so the server sanitizer (utils/sanitize.ts) and the admin
 * live preview (client DOMPurify) use the exact same rules — what the admin
 * sees in the preview is what gets saved.
 *
 * `u`, `s` and `mark` are what the editor emits for underline, strike-through
 * and highlight; without them those toolbar buttons silently did nothing
 * after saving.
 */
export const ALLOWED_TAGS = [
  'p', 'span', 'div', 'br', 'hr', 'b', 'i', 'u', 's', 'strong', 'em', 'mark',
  'sub', 'sup',
  'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

export const ALLOWED_ATTR = [
  'class', 'href', 'target', 'rel', 'src', 'alt', 'title',
  'width', 'height', 'style',
];
