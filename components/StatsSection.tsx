'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FiUsers,
  FiFileText,
  FiVideo,
  FiAward,
} from 'react-icons/fi';

const StatsSection = () => {
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [newsCount, setNewsCount] = useState<number | null>(null);
  const [videoCount, setVideoCount] = useState<number | null>(null);
  const [docCount, setDocCount] = useState<number | null>(null);

  useEffect(() => {
    axios
      .get('/api/members')
      .then((r) => setMemberCount(r.data.length))
      .catch(() => {});
    axios
      .get('/api/news')
      .then((r) => setNewsCount(r.data.length))
      .catch(() => {});
    axios
      .get('/api/video')
      .then((r) => setVideoCount(r.data.videos?.length ?? 0))
      .catch(() => {});
    axios
      .get('/api/standingCommittee?limit=1')
      .then((r) => setDocCount(r.data.currentCommittee ?? 0))
      .catch(() => {});
  }, []);

  const stats = [
    {
      icon: FiAward,
      value: docCount !== null ? `${docCount}` : '—',
      label: 'Баримт бичиг',
      sub: 'Нийт эрх зүйн актуул',
      color: 'from-blue-600 to-blue-800',
      shadow: 'shadow-blue-200',
    },
    {
      icon: FiUsers,
      value: memberCount !== null ? `${memberCount}` : '—',
      label: 'Зөвлөлийн гишүүн',
      sub: 'Бүртгэлтэй гишүүд',
      color: 'from-purple-600 to-purple-800',
      shadow: 'shadow-purple-200',
    },
    {
      icon: FiFileText,
      value: newsCount !== null ? `${newsCount}` : '—',
      label: 'Нийтлэгдсэн мэдээ',
      sub: 'Нийт мэдээллийн тоо',
      color: 'from-green-600 to-green-800',
      shadow: 'shadow-green-200',
    },
    {
      icon: FiVideo,
      value: videoCount !== null ? `${videoCount}` : '—',
      label: 'Видео мэдээлэл',
      sub: 'Видео санд байгаа тоо',
      color: 'from-red-500 to-red-700',
      shadow: 'shadow-red-200',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-[#0D47A1] to-[#1565C0] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">
            Тоо баримт
          </h2>
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">
            ЭМДҮЗ үйл ажиллагааны үзүүлэлтүүд
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadow} flex items-center justify-center`}
                >
                  <Icon size={22} className="text-white" />
                </div>
                <div className="text-4xl font-black text-white mb-1 tabular-nums">
                  {stat.value}
                </div>
                <div className="text-[13px] font-bold text-white/90 leading-tight">
                  {stat.label}
                </div>
                <div className="text-[10px] text-blue-200 mt-1 uppercase tracking-wider">
                  {stat.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
