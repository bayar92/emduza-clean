import Image from 'next/image';
import Link from 'next/link';
import { FiCalendar, FiArrowRight } from 'react-icons/fi';

interface NewsItem {
  id: number;
  slug: string;
  coverImage: string;
  title: string;
  date: Date | string;
  category: string;
}

interface Props {
  list: NewsItem[];
  currentSlug?: string;
}

const normPath = (p: string) => {
  if (!p) return '';
  const s = p.replace(/^public[/\\]/, '');
  return s.startsWith('/') ? s : `/${s}`;
};

function formatDate(d: Date | string) {
  const date = new Date(d);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export default function LatestNewsSidebar({ list, currentSlug }: Props) {
  const others = list.filter((n) => n.slug !== currentSlug).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] px-5 py-4">
          <h2 className="text-white font-black text-[13px] uppercase tracking-[0.15em]">
            Сүүлийн мэдээ
          </h2>
        </div>

        <div className="divide-y divide-gray-50">
          {others.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Мэдээ байхгүй</p>
          )}
          {others.map((item) => {
            const img = normPath(item.coverImage);
            return (
              <Link
                key={item.id}
                href={`/medee/${item.slug}`}
                className="flex gap-3 p-4 hover:bg-blue-50/50 transition-colors group"
              >
                <div className="relative w-20 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  {img ? (
                    <Image
                      src={img}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200" />
                  )}
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-800 group-hover:text-blue-600 line-clamp-2 leading-snug transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1">
                    <FiCalendar size={9} />
                    <span>{formatDate(item.date)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-gray-100">
          <Link
            href="/medee"
            className="flex items-center justify-center gap-2 text-blue-600 text-[12px] font-bold hover:text-blue-700 transition-colors"
          >
            Бүх мэдээ үзэх
            <FiArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Category links */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-4">
          <h2 className="text-white font-black text-[13px] uppercase tracking-[0.15em]">
            Ангилал
          </h2>
        </div>
        <div className="p-3 space-y-1">
          {[
            { href: '/medee', label: 'Бүх мэдээ', color: 'text-blue-600' },
            { href: '/medee/huraldaanii-toim', label: 'Хуралдааны тойм', color: 'text-blue-600' },
            { href: '/medee/technikiin-khoroo', label: 'Техникийн хороо', color: 'text-purple-600' },
            { href: '/medee/hynalt-unelgee', label: 'Хяналт, үнэлгээ', color: 'text-green-600' },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group text-[12px] font-bold ${c.color}`}
            >
              {c.label}
              <FiArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
