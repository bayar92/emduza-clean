import React from 'react';
import { BUILTIN_MENUS, type MenuKind } from '@/utils/menuPages';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

/**
 * Miniature of the site's top navigation showing where the entry will appear:
 * as its own item at the end of the bar, or inside the chain of dropdowns that
 * lead to it (built-in dropdown → sub-menu → ...), one cascading card per level.
 */
export default function MenuPlacementPreview({
  title,
  kind,
  parent,
  chain,
  rootBuiltin,
}: {
  title: string;
  kind: MenuKind;
  /** Built-in dropdown the entry sits directly in ('' otherwise). */
  parent: string;
  /** Groups leading to the entry, root first (empty when not inside a group). */
  chain: { id: number; title: string }[];
  /** Built-in dropdown at the root of `chain` ('' when the root is a custom top-level group). */
  rootBuiltin: string;
}) {
  const label = title.trim() || (kind === 'group' ? 'Шинэ цэс' : 'Шинэ хуудас');
  const isGroup = kind === 'group';

  const rootKey = chain.length ? rootBuiltin : parent;
  // The new entry is itself a pill in the bar only when it has no parent at all.
  const newIsPill = !rootKey && chain.length === 0;
  const customRoot = !rootKey && chain.length > 0 ? chain[0].title : null;
  // Labels shown one per dropdown level, ending with the new entry.
  const levels = [
    ...(rootKey ? chain.map((c) => c.title) : chain.slice(1).map((c) => c.title)),
    label,
  ];

  const pill = 'px-3 py-1.5 rounded-md text-[12px] font-semibold whitespace-nowrap';
  const idle = 'text-slate-600';
  const highlight = 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-200 ring-offset-1';
  const soft = 'bg-brand-50 text-brand-700';

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500" />

      <div className="flex flex-wrap items-center gap-1 px-3 py-2.5">
        <span className={`${pill} ${idle}`}>Нүүр</span>

        {BUILTIN_MENUS.map((m) => (
          <span
            key={m.id}
            className={`${pill} inline-flex items-center gap-0.5 ${m.id === rootKey ? soft : idle}`}
          >
            {m.label}
            <FiChevronDown size={13} />
          </span>
        ))}

        <span className={`${pill} ${idle}`}>Санал хүсэлт</span>

        {customRoot && (
          <span className={`${pill} inline-flex items-center gap-0.5 ${soft}`}>
            {customRoot}
            <FiChevronDown size={13} />
          </span>
        )}
        {newIsPill && (
          <span className={`${pill} inline-flex items-center gap-0.5 ${highlight}`}>
            {label}
            {isGroup && <FiChevronDown size={13} />}
          </span>
        )}
      </div>

      {newIsPill && isGroup && (
        <p className="px-4 pb-3 text-[12px] text-slate-400">
          Дэд цэсүүд энэ цэсний дотор гарна.
        </p>
      )}

      {!newIsPill && (
        <div className="px-3 pb-3 flex flex-wrap items-start gap-1.5">
          {levels.map((name, i) => {
            const last = i === levels.length - 1;
            return (
              <div
                key={i}
                className={`w-48 flex-shrink-0 rounded-xl border border-slate-100 shadow-[var(--shadow-card)] p-1.5 bg-white ${
                  i === 0 ? 'ml-3' : ''
                }`}
              >
                <p className="px-2.5 py-1 text-[11px] text-slate-400">… бусад цэсүүд</p>
                <div
                  className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold ${
                    last ? highlight : soft
                  }`}
                >
                  <span className="truncate">{name}</span>
                  {(!last || isGroup) && <FiChevronRight size={13} className="flex-shrink-0" />}
                </div>
                {last && isGroup && (
                  <p className="px-2.5 pt-1.5 pb-0.5 text-[11px] text-slate-400">
                    дэд цэсүүд энд гарна
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
