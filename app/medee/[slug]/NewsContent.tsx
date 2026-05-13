'use client';
import { useEffect, useState } from 'react';

export default function NewsContent({ html }: { html: string }) {
  const [clean, setClean] = useState('');

  useEffect(() => {
    import('dompurify').then(({ default: DOMPurify }) => {
      setClean(
        DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'blockquote', 'pre', 'code', 'a', 'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'div', 'span', 'figure', 'figcaption',
          ],
          ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel'],
        })
      );
    });
  }, [html]);

  return (
    <>
      <style>{`
        .news-content { color: #1f2937; font-size: 15px; line-height: 1.8; }
        .news-content p { margin-bottom: 1.1em; }
        .news-content h1,.news-content h2,.news-content h3,
        .news-content h4,.news-content h5,.news-content h6 {
          font-weight: 800; color: #111827; margin-top: 1.6em; margin-bottom: 0.6em; line-height: 1.3;
        }
        .news-content h1 { font-size: 1.6rem; }
        .news-content h2 { font-size: 1.35rem; }
        .news-content h3 { font-size: 1.15rem; }
        .news-content strong { font-weight: 700; color: #111827; }
        .news-content em { font-style: italic; }
        .news-content a { color: #2563eb; text-decoration: underline; }
        .news-content a:hover { color: #1d4ed8; }
        .news-content ul { list-style: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .news-content ol { list-style: decimal; padding-left: 1.5em; margin-bottom: 1em; }
        .news-content li { margin-bottom: 0.35em; }
        .news-content blockquote {
          border-left: 4px solid #2563eb; background: #eff6ff;
          padding: 0.75em 1.25em; border-radius: 0 12px 12px 0;
          margin: 1.5em 0; color: #1e40af; font-style: italic;
        }
        .news-content pre,.news-content code {
          background: #f1f5f9; border-radius: 6px;
          padding: 0.2em 0.5em; font-size: 0.88em; font-family: monospace;
        }
        .news-content pre { padding: 1em 1.25em; overflow-x: auto; }
        .news-content img { border-radius: 12px; max-width: 100%; height: auto; margin: 1em 0; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .news-content table { width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 13px; }
        .news-content th { background: #1d4ed8; color: white; font-weight: 700; padding: 10px 14px; text-align: left; }
        .news-content td { border: 1px solid #e5e7eb; padding: 9px 14px; }
        .news-content tr:nth-child(even) td { background: #f8fafc; }
      `}</style>
      <div className="news-content" dangerouslySetInnerHTML={{ __html: clean }} />
    </>
  );
}
