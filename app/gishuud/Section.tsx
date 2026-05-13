'use client';

import { useState } from 'react';
import { FiChevronDown, FiUser } from 'react-icons/fi';

type Member = {
  id: number;
  name: string | null;
  image: string | null;
  parlament?: string | null;
  education?: string | null;
  company?: string | null;
  position?: string | null;
};

type SectionProps = {
  title: string;
  color: string;
  members: Member[];
};

const normPath = (p: string) => {
  if (!p) return '';
  let path = p.replace(/^public[/\\]/, '/');
  if (!path.startsWith('/')) path = `/${path}`;
  return path;
};

export default function Section({ title, color, members }: SectionProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (members.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-1 h-7 rounded-full ${color}`} />
        <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {members.map((m) => {
          const isOpen = expanded === m.id;
          const imgSrc = m.image ? normPath(m.image) : null;

          return (
            <div
              key={m.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-[280px] bg-gray-100 overflow-hidden">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={m.name ?? ''}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <FiUser size={48} className="text-gray-300" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-black text-[15px] leading-tight drop-shadow">
                    {m.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                <span>{isOpen ? 'Хаах' : 'Дэлгэрэнгүй харах'}</span>
                <FiChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-gray-400'}`}
                />
              </button>

              <div
                className={`transition-all duration-300 border-t border-gray-50 ${isOpen ? 'max-h-[280px] overflow-y-auto' : 'max-h-0 overflow-hidden'}`}
              >
                <div className="px-4 pb-4 space-y-3 text-[12px] text-gray-700 leading-relaxed">
                  {m.parlament && (
                    <div className="pt-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                        Парламент / Намтар
                      </p>
                      <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: m.parlament }}
                      />
                    </div>
                  )}
                  {m.company && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                        Байгууллага
                      </p>
                      <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: m.company }}
                      />
                    </div>
                  )}
                  {m.education && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                        Боловсрол
                      </p>
                      <div
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: m.education }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
