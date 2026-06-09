import { prisma } from '@/utils/prisma';
import TopNavBar from '@/components/TopNavBar';
import FooterNavBar from '@/components/FooterNavBar';
import Image from 'next/image';
import Link from 'next/link';
import { FiCalendar, FiChevronRight, FiTag } from 'react-icons/fi';
import NewsContent from './NewsContent';
import NewsImagesSlider from './NewsImagesSlider';
import NewsComments from './NewsComments';
import LatestNewsSidebar from './LatestNewsSidebar';
import ShareButtons from '@/components/ShareButtons';


export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
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

const categoryColors: Record<string, string> = {
  'ЭМДҮЗ-ийн хуралдаан, хуралдааны тойм': 'bg-blue-100 text-blue-700',
  'Техникийн хорооны мэдээлэл': 'bg-purple-100 text-purple-700',
  'Хяналт, үнэлгээний талаар': 'bg-green-100 text-green-700',
};

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const news = await prisma.news.findUnique({ where: { slug } });

  if (!news) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <TopNavBar />
        <div className="pt-40 text-center text-gray-400 font-bold text-lg">
          Мэдээ олдсонгүй
        </div>
        <FooterNavBar />
      </div>
    );
  }

  const latestNews = await prisma.news.findMany({
    orderBy: { date: 'desc' },
    take: 6,
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      date: true,
      category: true,
    },
  });

  const imgSrc = normPath(news.coverImage);
  const badgeClass =
    categoryColors[news.category] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopNavBar />

      {/* Breadcrumb */}

      <div className="mt-2 w-full h-[1px] bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#2E7D32]" />
      {/* <div className="border-2 mt-1 border-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#2E7D32]" /> */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-2">
          <div className="flex items-center gap-2 text-gray-400 text-[11px] font-bold">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Нүүр
            </Link>
            <FiChevronRight size={11} />
            <Link
              href="/medee"
              className="hover:text-blue-600 transition-colors"
            >
              Мэдээ мэдээлэл
            </Link>
            <FiChevronRight size={11} />
            <span className="text-gray-500 truncate max-w-[300px]">
              {news.title}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Single 2-column layout — sidebar spans full height */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: all main content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Cover image */}
            <div className="relative w-full h-[360px] md:h-[460px] rounded-2xl overflow-hidden bg-gray-200 shadow-sm">
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={news.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0D47A1] to-[#1565C0]" />
              )}
            </div>

            {/* Title + meta */}
            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-3 ${badgeClass}`}
              >
                <FiTag size={10} />
                {news.category}
              </span>
              <h1 className="text-2xl md:text-[28px] font-black text-gray-900 leading-snug">
                {news.title}
              </h1>
              <div className="flex items-center justify-between flex-wrap gap-3 mt-3">
                <div className="flex items-center gap-2 text-gray-400 text-[12px] font-medium">
                  <FiCalendar size={12} />
                  <span>{formatDate(news.date)}</span>
                </div>
                <ShareButtons title={news.title} />
              </div>
            </div>

            {/* Article content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
              <NewsContent html={news.content} />
            </div>

            {/* Images slider */}
            {news.images && news.images.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-[13px] font-black text-gray-500 uppercase tracking-[0.15em] mb-4">
                  Зурган мэдээлэл
                </h2>
                <NewsImagesSlider images={news.images} />
              </div>
            )}

            {/* Comments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <NewsComments newsId={news.id} />
            </div>
          </div>

          {/* RIGHT: sticky sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 self-start sticky top-24">
            <LatestNewsSidebar list={latestNews} currentSlug={slug} />
          </aside>
        </div>
      </div>

      <FooterNavBar />
    </div>
  );
}
