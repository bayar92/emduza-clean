'use client';
import React from 'react';
import Link from 'next/link';
import {
  FiInfo,
  FiUsers,
  FiFileText,
  FiBookOpen,
  FiBarChart2,
  FiDollarSign,
} from 'react-icons/fi';

const links = [
  {
    icon: FiInfo,
    label: 'Бидний тухай',
    sub: 'ЭМДҮЗ танилцуулга',
    href: '/taniltsuulga',
    color:
      'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    border: 'border-blue-100 group-hover:border-blue-600',
  },
  {
    icon: FiUsers,
    label: 'Зөвлөлийн гишүүд',
    sub: 'Бүрэлдэхүүн хэсэг',
    href: '/gishuud',
    color:
      'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    border: 'border-purple-100 group-hover:border-purple-600',
  },
  {
    icon: FiFileText,
    label: 'Мэдээ мэдээлэл',
    sub: 'Сүүлийн үеийн мэдээ',
    href: '/medee',
    color:
      'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white',
    border: 'border-green-100 group-hover:border-green-600',
  },
  {
    icon: FiBookOpen,
    label: 'Эрх зүй',
    sub: 'Хууль, тогтоол, шийдвэр',
    href: '/erkhzui',
    color:
      'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
    border: 'border-orange-100 group-hover:border-orange-600',
  },
  {
    icon: FiBarChart2,
    label: 'Тайлан',
    sub: 'Үйл ажиллагааны тайлан',
    href: '#',
    color:
      'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white',
    border: 'border-red-100 group-hover:border-red-500',
  },
  {
    icon: FiDollarSign,
    label: 'Шилэн данс',
    sub: 'Санхүүгийн ил тод байдал',
    href: 'https://shilendans.gov.mn/organization/4984',
    color:
      'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white',
    border: 'border-teal-100 group-hover:border-teal-600',
    external: true,
  },
];

const QuickLinks = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="w-8 h-[3px] bg-blue-600 rounded-full" />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">
              Эрүүл мэндийн даатгалын үндэсний зөвлөл
            </h2>
            <span className="w-8 h-[3px] bg-blue-600 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {links.map((item, i) => {
            const Icon = item.icon;
            const Tag = item.external ? 'a' : Link;
            const extraProps = item.external
              ? {
                  href: item.href,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }
              : { href: item.href };

            return (
              <Tag
                key={i}
                {...(extraProps as any)}
                className={`group flex flex-col items-center text-center p-5 rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${item.border}`}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 mb-3 ${item.color}`}
                >
                  <Icon size={22} />
                </div>
                <span className="text-[13px] font-black text-gray-800 group-hover:text-gray-900 leading-tight">
                  {item.label}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 leading-tight">
                  {item.sub}
                </span>
              </Tag>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
