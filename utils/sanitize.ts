import DOMPurify from 'isomorphic-dompurify';
import { ALLOWED_TAGS, ALLOWED_ATTR } from './htmlAllowlist';

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
