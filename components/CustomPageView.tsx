// Presentational (no 'use client', no data fetching): rendered by the public
// /khuudas/[slug] Server Component AND by the admin live preview, so the
// preview is pixel-identical to what visitors will see.
import React from 'react';
import Link from 'next/link';
import { FiChevronRight } from 'react-icons/fi';

type Props = {
  title: string;
  /** Already-sanitized HTML. */
  html: string;
  /** Inside the admin preview: no real navigation. */
  preview?: boolean;
};

export default function CustomPageView({ title, html, preview = false }: Props) {
  return (
    <>
      <div className="bg-gradient-to-br from-brand-600 to-brand-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="container mx-auto px-6 py-10 md:py-12 relative z-10">
          <div className="flex items-center gap-2 text-brand-200 text-[12px] font-semibold mb-3">
            {preview ? (
              <span>Нүүр</span>
            ) : (
              <Link href="/" className="hover:text-white transition-colors">
                Нүүр
              </Link>
            )}
            <FiChevronRight size={12} />
            <span className="text-white truncate">{title}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight break-words">
            {title}
          </h1>
        </div>
      </div>

      <div className="bg-slate-50">
        <div className="container mx-auto px-6 py-8 md:py-10">
          <article className="card max-w-4xl mx-auto p-6 md:p-10">
            {html ? (
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-center text-slate-400 text-sm py-10">
                Агуулга одоогоор хоосон байна.
              </p>
            )}
          </article>
        </div>
      </div>
    </>
  );
}
