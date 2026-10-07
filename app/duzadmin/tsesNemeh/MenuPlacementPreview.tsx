import React from 'react';
import { BUILTIN_MENUS } from '@/utils/menuPages';
import { FiChevronDown } from 'react-icons/fi';

/**
 * Miniature of the site's top navigation showing where the new entry will
 * appear: as its own link at the end of the bar, or inside one of the
 * existing dropdowns.
 */
export default function MenuPlacementPreview({
  title,
  parent,
}: {
  title: string;
  parent: string;
}) {
  const label = title.trim() || 'Шинэ цэс';
  const standalone = parent === '';

  const pill = 'px-3 py-1.5 rounded-md text-[12px] font-semibold whitespace-nowrap';
  const idle = 'text-slate-600';
  const highlight =
    'bg-brand-600 text-white shadow-sm ring-2 ring-brand-200 ring-offset-1';

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500" />

      <div className="flex items-center gap-1 px-3 py-2.5 overflow-x-auto">
        <span className={`${pill} ${idle}`}>Нүүр</span>

        {BUILTIN_MENUS.map((m) => (
          <span
            key={m.id}
            className={`${pill} inline-flex items-center gap-0.5 ${
              m.id === parent ? 'bg-brand-50 text-brand-700' : idle
            }`}
          >
            {m.label}
            <FiChevronDown size={13} />
          </span>
        ))}

        <span className={`${pill} ${idle}`}>Санал хүсэлт</span>

        {standalone && <span className={`${pill} ${highlight}`}>{label}</span>}
      </div>

      {!standalone && (
        <div className="px-3 pb-3">
          <div className="ml-4 w-64 rounded-xl border border-slate-100 shadow-[var(--shadow-card)] p-1.5 bg-white">
            <p className="px-3 py-1.5 text-[11px] text-slate-400">
              … одоо байгаа дэд цэсүүд
            </p>
            <div
              className={`px-3 py-2 rounded-lg text-[13px] font-semibold ${highlight}`}
            >
              {label}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
