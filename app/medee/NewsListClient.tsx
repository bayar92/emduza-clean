'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

type NewsItem = {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  date: string;
  category: string;
};

const normPath = (p: string) => {
  if (!p) return '';
  const s = p.replace(/^public[/\\]/, '');
  return s.startsWith('/') ? s : `/${s}`;
};

const ITEMS_PER_PAGE = 12;

function formatDate(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

const categoryColors: Record<string, string> = {
  'ЭМДҮЗ-ийн хуралдаан, хуралдааны тойм': 'bg-blue-600',
  'Техникийн хорооны мэдээлэл': 'bg-purple-600',
  'Хяналт, үнэлгээний талаар': 'bg-green-600',
};

export default function NewsListClient({ news }: { news: NewsItem[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(news.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const current = news.slice(start, start + ITEMS_PER_PAGE);

  if (news.length === 0) {
    return (
      <div className="py-24 text-center text-gray-400 text-sm font-medium">
        Мэдээ байхгүй байна
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {current.map((item) => {
          const badgeColor = categoryColors[item.category] ?? 'bg-blue-600';
          const imgSrc = normPath(item.coverImage);
          return (
            <Link
              key={item.id}
              href={`/medee/${item.slug}`}
              className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <span className="text-blue-400 text-3xl font-black opacity-30">
                      М
                    </span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2.5 py-1 ${badgeColor} text-white text-[10px] font-bold rounded-full uppercase tracking-wider`}
                  >
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-1 p-4">
                <h3 className="text-[14px] font-bold text-gray-800 group-hover:text-blue-600 leading-snug line-clamp-3 transition-colors flex-1">
                  {item.title}
                </h3>
                <div className="mt-3 flex items-center gap-1.5 text-gray-400 text-[11px]">
                  <FiCalendar size={11} />
                  <span>{formatDate(item.date)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-bold border transition-all ${
                n === page
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200'
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </>
  );
}
