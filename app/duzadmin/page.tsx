'use client';

import React, { useEffect, useState } from 'react';
import withAuth from '@/components/withAuth';
import Link from 'next/link';
import Head from 'next/head';
import {
  FiDatabase,
  FiUsers,
  FiVideo,
  FiFileText,
  FiHome,
  FiClipboard,
  FiLayers,
  FiActivity,
  FiExternalLink,
} from 'react-icons/fi';

type Stats = {
  news: number;
  members: number;
  videos: number;
  committee: number;
};

const QUICK_LINKS = [
  {
    href: '/duzadmin/mendchilgee',
    icon: FiHome,
    label: 'Даргын мэндчилгээ',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    href: '/duzadmin/emduzTaniltsuulga',
    icon: FiClipboard,
    label: 'ЭМДҮЗ танилцуулга',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  },
  {
    href: '/duzadmin/emduzGishuud',
    icon: FiUsers,
    label: 'Гишүүдийн жагсаалт',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    href: '/duzadmin/medee',
    icon: FiDatabase,
    label: 'Мэдээ мэдээлэл',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    href: '/duzadmin/VideoMedee',
    icon: FiVideo,
    label: 'Видео мэдээ',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  {
    href: '/duzadmin/shiidwer',
    icon: FiLayers,
    label: 'Эрх зүй',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    news: 0,
    members: 0,
    videos: 0,
    committee: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [newsRes, membersRes, videosRes, committeeRes] =
          await Promise.all([
            fetch('/api/news'),
            fetch('/api/members'),
            fetch('/api/video?page=1&limit=1'),
            fetch('/api/standingCommittee?page=1&limit=1'),
          ]);
        const [news, members, videos, committee] = await Promise.all([
          newsRes.json(),
          membersRes.json(),
          videosRes.json(),
          committeeRes.json(),
        ]);
        setStats({
          news: Array.isArray(news) ? news.length : 0,
          members: Array.isArray(members) ? members.length : 0,
          videos: videos.totalVideos ?? 0,
          committee: committee.currentCommittee ?? 0,
        });
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const STAT_CARDS = [
    {
      label: 'Нийт мэдээ',
      value: stats.news,
      icon: FiDatabase,
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      href: '/duzadmin/medee',
    },
    {
      label: 'Нийт гишүүн',
      value: stats.members,
      icon: FiUsers,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      href: '/duzadmin/emduzGishuud',
    },
    {
      label: 'Нийт видео',
      value: stats.videos,
      icon: FiVideo,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      href: '/duzadmin/VideoMedee',
    },
    {
      label: 'Баримт бичиг',
      value: stats.committee,
      icon: FiFileText,
      color: 'bg-purple-600',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      href: '/duzadmin/shiidwer',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Head>
        <title>Admin Dashboard | ЭМДҮЗ</title>
      </Head>

      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FiActivity className="text-blue-600" />
                Админ удирдлага
              </h1>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1.5">
                ЭМДҮЗ-ийн удирдлагын систем •{' '}
                {new Date().toLocaleDateString('mn-MN')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                Систем хэвийн
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {STAT_CARDS.map((card) => (
            <Link key={card.href} href={card.href}>
              <div className="bg-white rounded-[28px] border border-gray-100 p-6 flex items-center justify-between group hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-gray-500 transition-colors">
                    {card.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-gray-900 tracking-tighter">
                      {loading ? (
                        <span className="inline-block w-8 h-8 bg-gray-100 animate-pulse rounded-md"></span>
                      ) : (
                        card.value
                      )}
                    </p>
                    <FiExternalLink
                      className="text-gray-300 group-hover:text-blue-500 transition-colors"
                      size={14}
                    />
                  </div>
                </div>
                <div
                  className={`${card.lightColor} ${card.textColor} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                >
                  <card.icon size={28} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">
              Цэс
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className={`${link.color} border rounded-[22px] p-6 flex items-center gap-4 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-black/5 group`}
                >
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all">
                    <link.icon size={22} />
                  </div>
                  <div>
                    <span className="text-[15px] font-bold tracking-tight">
                      {link.label}
                    </span>
                    <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider mt-0.5">
                      Удирдах хэсэг
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AdminDashboard);
