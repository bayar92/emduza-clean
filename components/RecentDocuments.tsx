'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FiDownload, FiChevronRight, FiCalendar } from 'react-icons/fi';

type DocItem = {
  id: number;
  text: string;
  category: string;
  number: number;
  day: number;
  month: number;
  Date: string;
  filename: string | null;
};

const categoryColor: Record<string, string> = {
  'УИХ, Байнгын хорооны шийдвэр': 'bg-blue-50 text-blue-700',
  'Засгийн газрын тогтоол': 'bg-green-50 text-green-700',
  'ЭМДҮЗ-ийн тогтоолууд': 'bg-purple-50 text-purple-700',
};

const RecentDocuments = () => {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/standingCommittee?limit=6&sortOrder=desc')
      .then((r) => setDocs(r.data.stcommittee ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && docs.length === 0) return null;

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-6 bg-orange-500 rounded-full" />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                Сүүлийн баримт бичгүүд
              </h2>
            </div>
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em] ml-5">
              Эрх зүйн актуул, тогтоол, шийдвэрүүд
            </p>
          </div>
          <Link
            href="/erkhzui"
            className="hidden md:flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Бүгдийг харах <FiChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse p-5 rounded-2xl bg-gray-50 border border-gray-100"
              >
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc) => {
              const badgeCls =
                categoryColor[doc.category] ?? 'bg-gray-50 text-gray-600';
              return (
                <div
                  key={doc.id}
                  className="group flex flex-col p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md hover:border-gray-200 transition-all duration-300"
                >
                  <span
                    className={`self-start px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide mb-3 ${badgeCls}`}
                  >
                    {doc.category}
                  </span>

                  <p className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 flex-1 mb-3 group-hover:text-gray-900">
                    {doc.number}-р тогтоол: {doc.text}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                      <FiCalendar size={11} />
                      {new Date(doc.Date).toLocaleDateString('mn-MN')}
                    </span>

                    {doc.filename && (
                      <a
                        href={`/uploads/file/${doc.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiDownload size={12} /> Татах
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center md:hidden">
          <Link
            href="/erkhzui"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-blue-100 text-blue-600 text-[12px] font-bold hover:bg-blue-50 transition-colors"
          >
            Бүгдийг харах <FiChevronRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentDocuments;
