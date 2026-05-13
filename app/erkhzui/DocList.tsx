'use client';

import { useState } from 'react';
import { FiDownload, FiFileText, FiCalendar, FiChevronLeft, FiChevronRight, FiEye, FiX } from 'react-icons/fi';

function isPdf(filename: string) {
  return filename.toLowerCase().endsWith('.pdf');
}

type Doc = {
  id: number;
  text: string;
  filename: string | null;
  category: string | null;
  number: number;
  Date: string;
};

const categoryColors: Record<string, string> = {
  'УИХ, Байнгын хорооны шийдвэр': 'bg-blue-100 text-blue-700',
  'Засгийн газрын тогтоол': 'bg-orange-100 text-orange-700',
  'ЭМДҮЗ-ийн тогтоол': 'bg-purple-100 text-purple-700',
};

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

const ITEMS_PER_PAGE = 5;

export default function DocList({ docs, showCategory = true }: { docs: Doc[]; showCategory?: boolean }) {
  const [page, setPage] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const totalPages = Math.ceil(docs.length / ITEMS_PER_PAGE);
  const current = docs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (docs.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <FiFileText size={32} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">Баримт бичиг байхгүй байна</p>
      </div>
    );
  }

  return (
    <>
      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewUrl(null)}>
          <div
            className="relative w-full max-w-4xl h-[88vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0">
              <span className="text-[13px] font-bold text-gray-700">Баримт бичиг үзэх</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-bold rounded-xl transition-colors"
                >
                  <FiEye size={13} />
                  Шинэ tab
                </a>
                <a
                  href={previewUrl}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-xl transition-colors"
                >
                  <FiDownload size={13} />
                  Татах
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>
            {isPdf(previewUrl) ? (
              <iframe
                src={previewUrl}
                className="flex-1 w-full"
                title="Document preview"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500">
                <FiFileText size={48} className="text-gray-300" />
                <p className="text-[14px] font-bold text-gray-600">Word / Excel файлыг шууд харах боломжгүй</p>
                <p className="text-[12px] text-gray-400">Татаж авснаар нээнэ үү</p>
                <a
                  href={previewUrl}
                  download
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-xl transition-colors"
                >
                  <FiDownload size={15} />
                  Татах
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="divide-y divide-gray-100">
        {current.map((doc, idx) => {
          const badge = categoryColors[doc.category ?? ''] ?? 'bg-gray-100 text-gray-600';
          const fileUrl = doc.filename ? `/uploads/file/${encodeURIComponent(doc.filename)}` : null;
          const globalIdx = (page - 1) * ITEMS_PER_PAGE + idx + 1;

          return (
            <div key={doc.id} className="flex items-center gap-4 py-4 px-2 hover:bg-blue-50/40 rounded-xl transition-colors group">
              {/* Row number */}
              <span className="w-7 text-center text-[12px] font-black text-gray-300 flex-shrink-0">
                {globalIdx}
              </span>

              {/* Icon */}
              <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <FiFileText size={18} className="text-blue-600" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {showCategory && doc.category && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge}`}>
                      {doc.category}
                    </span>
                  )}
                  <span className="text-[11px] text-gray-400 font-medium">№{doc.number}</span>
                </div>
                <p className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-snug">
                  {doc.text}
                </p>
                <div className="flex items-center gap-1 mt-1 text-gray-400 text-[11px]">
                  <FiCalendar size={10} />
                  <span>{formatDate(doc.Date)}</span>
                </div>
              </div>

              {/* Actions */}
              {fileUrl && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setPreviewUrl(fileUrl)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-xl transition-colors"
                  >
                    <FiEye size={13} />
                    <span className="hidden sm:inline">Үзэх</span>
                  </button>
                  <a
                    href={fileUrl}
                    download
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl transition-colors"
                  >
                    <FiDownload size={13} />
                    <span className="hidden sm:inline">Татах</span>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
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
