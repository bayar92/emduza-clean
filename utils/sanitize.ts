import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p', 'span', 'div', 'br', 'b', 'i', 'strong', 'em',
  'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code', 'img', 'table', 'thead', 'tbody',
  'tr', 'th', 'td',
];

const ALLOWED_ATTR = [
  'class', 'href', 'target', 'rel', 'src', 'alt', 'title',
  'width', 'height', 'style',
];

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
