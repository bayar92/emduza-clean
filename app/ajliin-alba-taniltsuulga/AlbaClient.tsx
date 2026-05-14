'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface AlbaData {
  id: string | number;
  content: string | null;
}

export default function AlbaClient({ intro }: { intro: AlbaData }) {
  const safeHTML = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return DOMPurify.sanitize(intro.content ?? '', {
      ALLOWED_TAGS: [
        'p', 'span', 'div', 'br', 'b', 'i', 'strong', 'em',
        'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'pre', 'code', 'img', 'table', 'thead', 'tbody',
        'tr', 'th', 'td',
      ],
      ALLOWED_ATTR: ['class', 'href', 'target', 'src', 'alt', 'title', 'width', 'height', 'style'],
    });
  }, [intro.content]);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 rounded-full bg-blue-600" />
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
          Ажлын албаны танилцуулга
        </h2>
      </div>

      <div
        className="
          prose prose-sm max-w-none text-gray-700 leading-relaxed
          [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-gray-900 [&_h1]:mb-4
          [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-gray-800 [&_h2]:mb-3 [&_h2]:mt-6
          [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-gray-800 [&_h3]:mb-2
          [&_p]:mb-4 [&_p]:text-gray-700 [&_p]:text-[14px] [&_p]:leading-relaxed
          [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1 [&_li]:text-gray-700 [&_li]:text-[14px]
          [&_ol]:pl-5 [&_ol]:mb-4
          [&_strong]:text-gray-900 [&_strong]:font-bold
          [&_blockquote]:border-l-4 [&_blockquote]:border-blue-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600
          [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:my-4
          [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
          [&_table]:w-full [&_table]:border-collapse [&_table]:text-[13px]
          [&_th]:bg-gray-50 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold [&_th]:text-gray-700 [&_th]:border [&_th]:border-gray-200
          [&_td]:px-4 [&_td]:py-2 [&_td]:text-gray-700 [&_td]:border [&_td]:border-gray-200
        "
        dangerouslySetInnerHTML={{ __html: safeHTML }}
      />
    </div>
  );
}
