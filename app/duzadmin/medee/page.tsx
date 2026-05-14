'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import { useDialog } from '@/components/useDialog';
import {
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiGrid,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

type NewsItem = {
  id: number;
  title: string;
  slug: string;
  category: string;
  content: string;
  coverImage: string;
  createdAt: string;
};

export default function Medee() {
  const router = useRouter();
  const { confirm, alert, dialog } = useDialog();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 12;

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      setNews(data);
    } catch {
      setError('Мэдээлэл татахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleDelete = async (id: number) => {
    if (!(await confirm('Та энэ мэдээг устгахдаа итгэлтэй байна уу?'))) return;

    try {
      await fetch(`/api/news?id=${id}`, {
        method: 'DELETE',
      });
      fetchNews();
    } catch {
      await alert('Устгахад алдаа гарлаа');
    }
  };

  const handleEdit = (item: NewsItem) => {
    router.push(`/duzadmin/medeeNemeh?slug=${item.slug}`);
  };

  const paginated = news.slice((page - 1) * perPage, page * perPage);
  const pageCount = Math.ceil(news.length / perPage);

  if (loading && news.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600/20 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {dialog}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiGrid className="text-blue-600" />
              Мэдээний жагсаалт
            </h1>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-1">
              Нийт {news.length} мэдээ бүртгэлтэй байна
            </p>
          </div>

          <button
            onClick={() => router.push('/duzadmin/medeeNemeh')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <FiPlus size={18} />
            Шинэ мэдээ нэмэх
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginated.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={item.coverImage || '/no-image.png'}
                  fill
                  alt={item.title}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm text-blue-600 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col h-[200px]">
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <FiCalendar />
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>

                <h3 className="text-base font-bold text-gray-800 line-clamp-2 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>

                <div
                  className="text-[13px] text-gray-500 line-clamp-3 leading-relaxed mb-4 flex-1"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(item.content),
                  }}
                />

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <FiEdit3 /> Засах
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
                  >
                    <FiTrash2 /> Устгах
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pageCount > 1 && (
          <div className="flex justify-center items-center mt-12 gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-xl border bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <FiChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    page === i + 1
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110'
                      : 'bg-white border text-gray-500 hover:border-blue-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="p-2.5 rounded-xl border bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
