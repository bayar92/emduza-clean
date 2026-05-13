import { prisma } from '@/utils/prisma';
import TopNavBar from '@/components/TopNavBar';
import FooterNavBar from '@/components/FooterNavBar';
import Link from 'next/link';
import { FiChevronRight, FiFileText } from 'react-icons/fi';
import NewsListClient from './NewsListClient';

export const dynamic = 'force-dynamic';

const categoryLinks = [
  { href: '/medee/huraldaanii-toim', label: 'Хуралдааны тойм' },
  { href: '/medee/technikiin-khoroo', label: 'Техникийн хороо' },
  { href: '/medee/hynalt-unelgee', label: 'Хяналт, үнэлгээ' },
];

export default async function MedeePage() {
  const allNews = await prisma.news.findMany({
    orderBy: { date: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      date: true,
      category: true,
    },
  });

  const serialized = allNews.map((item) => ({
    ...item,
    date: item.date.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopNavBar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0D47A1] to-[#1565C0] pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full bg-white/5" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-blue-200 text-[12px] font-bold mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Нүүр
            </Link>
            <FiChevronRight size={12} />
            <span className="text-white">Мэдээ мэдээлэл</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <FiFileText size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                Мэдээ мэдээлэл
              </h1>
              <p className="text-blue-200 text-sm mt-1 font-medium">
                Сүүлийн үеийн мэдээ, мэдээллүүд
              </p>
            </div>
          </div>

          {/* Category sub-nav */}
          <div className="flex flex-wrap gap-2 mt-6">
            <Link
              href="/medee"
              className="px-4 py-1.5 rounded-xl bg-white text-blue-700 text-[12px] font-bold shadow-sm"
            >
              Бүх мэдээ
            </Link>
            {categoryLinks.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="px-4 py-1.5 rounded-xl bg-white/10 text-white text-[12px] font-bold hover:bg-white/20 transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                Бүх мэдээ
              </h2>
            </div>
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em] ml-5">
              Нийт {allNews.length} мэдээ
            </p>
          </div>
        </div>

        <NewsListClient news={serialized} />
      </div>

      <FooterNavBar />
    </div>
  );
}
