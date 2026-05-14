'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiCalendar, FiChevronRight } from 'react-icons/fi';

export type NewsItem = {
  id: string | number;
  title: string;
  slug: string;
  coverImage: string;
  date: string;
  category: string;
};

const tabs = [
  { id: 'tab1', label: 'Онцлох мэдээ' },
  { id: 'tab2', label: 'ЭМДҮЗ-ийн хуралдаан' },
  { id: 'tab3', label: 'Техникийн хороо' },
  { id: 'tab4', label: 'Хяналт, үнэлгээ' },
];

const normPath = (p: string) => (p && !p.startsWith('/') ? `/${p}` : p);

const FeaturedNewsClient = ({ news }: { news: NewsItem[] }) => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>(
    tabs[0].id
  );

  const getFilteredNews = (): NewsItem[] => {
    if (activeTab === 'tab1') return news.slice(-4).reverse();
    const categoryMap: Record<string, string> = {
      tab2: 'ЭМДҮЗ-ийн хуралдаан, хуралдааны тойм',
      tab3: 'Техникийн хорооны мэдээлэл',
      tab4: 'Хяналт, үнэлгээний талаар',
    };
    const category = categoryMap[activeTab];
    if (!category) return [];
    return news
      .filter((item) => item.category === category)
      .slice(-4)
      .reverse();
  };

  const currentNews = getFilteredNews();
  const mainNews = currentNews[0];
  const sideNews = currentNews.slice(1, 4);

  const categoryHrefMap: Record<string, string> = {
    tab2: '/medee/huraldaanii-toim',
    tab3: '/medee/technikiin-khoroo',
    tab4: '/medee/hynalt-unelgee',
  };
  const viewAllHref =
    activeTab === 'tab1' ? '/medee' : (categoryHrefMap[activeTab] ?? '/medee');

  return (
    <section className="py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              Мэдээ мэдээлэл
            </h2>
          </div>
          <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.2em] ml-5">
            Сүүлийн үеийн мэдээллүүд
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            href={viewAllHref}
            className="hidden md:flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap transition-colors"
          >
            Бүгдийг харах <FiChevronRight size={14} />
          </Link>
        </div>
      </div>

      {currentNews.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-sm font-medium">
          Мэдээ байхгүй байна
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            {mainNews && (
              <Link
                href={`/medee/${mainNews.slug}`}
                className="group relative block overflow-hidden rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="relative aspect-[21/9] overflow-hidden">
                  <Image
                    src={normPath(mainNews.coverImage)}
                    alt={mainNews.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                </div>

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {mainNews.category}
                  </span>
                </div>

                <div className="absolute bottom-0 p-6 w-full">
                  <div className="flex items-center gap-2 text-gray-300 text-[11px] mb-2">
                    <FiCalendar size={11} />
                    <span>
                      {new Date(mainNews.date).toLocaleDateString('mn-MN')}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                    {mainNews.title}
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-1 text-blue-400 text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Дэлгэрэнгүй <FiArrowRight size={12} />
                  </div>
                </div>
              </Link>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3">
            {sideNews.map((item) => (
              <Link
                key={item.id}
                href={`/medee/${item.slug}`}
                className="group flex gap-4 items-center p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"
              >
                <div className="relative w-[76px] h-[76px] flex-shrink-0 rounded-xl overflow-hidden">
                  <Image
                    src={normPath(item.coverImage)}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-gray-800 group-hover:text-blue-600 leading-tight line-clamp-2 transition-colors">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <FiCalendar size={9} />
                    {new Date(item.date).toLocaleDateString('mn-MN')}
                  </span>
                </div>
              </Link>
            ))}

            <Link
              href={viewAllHref}
              className="mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-100 text-blue-600 text-[12px] font-bold hover:bg-blue-50 transition-colors"
            >
              Бүгдийг харах <FiChevronRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedNewsClient;
