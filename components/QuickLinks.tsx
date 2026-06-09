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

type LinkTone = {
  iconBg: string;
  iconText: string;
  iconBgHover: string;
  borderHover: string;
};

// Tone palette keeps each tile distinct without yelling. Saturation softened
// vs. the previous bright group-hover white-on-color treatment.
const tones: Record<string, LinkTone> = {
  brand:   { iconBg: 'bg-brand-50',   iconText: 'text-brand-600',   iconBgHover: 'group-hover:bg-brand-100',   borderHover: 'group-hover:border-brand-200' },
  purple:  { iconBg: 'bg-violet-50',  iconText: 'text-violet-600',  iconBgHover: 'group-hover:bg-violet-100',  borderHover: 'group-hover:border-violet-200' },
  green:   { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', iconBgHover: 'group-hover:bg-emerald-100', borderHover: 'group-hover:border-emerald-200' },
  orange:  { iconBg: 'bg-amber-50',   iconText: 'text-amber-600',   iconBgHover: 'group-hover:bg-amber-100',   borderHover: 'group-hover:border-amber-200' },
  red:     { iconBg: 'bg-rose-50',    iconText: 'text-rose-600',    iconBgHover: 'group-hover:bg-rose-100',    borderHover: 'group-hover:border-rose-200' },
  teal:    { iconBg: 'bg-teal-50',    iconText: 'text-teal-600',    iconBgHover: 'group-hover:bg-teal-100',    borderHover: 'group-hover:border-teal-200' },
};

type LinkItem = {
  icon: typeof FiInfo;
  label: string;
  sub: string;
  href: string;
  tone: keyof typeof tones;
  external?: boolean;
};

const links: LinkItem[] = [
  { icon: FiInfo,        label: 'Бидний тухай',     sub: 'ЭМДҮЗ танилцуулга',       href: '/taniltsuulga', tone: 'brand' },
  { icon: FiUsers,       label: 'Зөвлөлийн гишүүд', sub: 'Бүрэлдэхүүн хэсэг',       href: '/gishuud',      tone: 'purple' },
  { icon: FiFileText,    label: 'Мэдээ мэдээлэл',   sub: 'Сүүлийн үеийн мэдээ',     href: '/medee',        tone: 'green' },
  { icon: FiBookOpen,    label: 'Эрх зүй',          sub: 'Хууль, тогтоол, шийдвэр', href: '/erkhzui',      tone: 'orange' },
  { icon: FiBarChart2,   label: 'Тайлан',           sub: 'Үйл ажиллагааны тайлан',  href: '#',             tone: 'red' },
  { icon: FiDollarSign,  label: 'Шилэн данс',       sub: 'Санхүүгийн ил тод байдал', href: 'https://shilendans.gov.mn/organization/4984', tone: 'teal', external: true },
];

const QuickLinks = () => {
  return (
    <section className="py-14">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <p className="eyebrow mb-3">Үндсэн цэс</p>
          <h2 className="text-2xl md:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Эрүүл мэндийн даатгалын үндэсний зөвлөл
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {links.map((item, i) => {
            const Icon = item.icon;
            const tone = tones[item.tone];
            const Tag = item.external ? 'a' : Link;
            const extraProps = item.external
              ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
              : { href: item.href };

            return (
              <Tag
                key={i}
                {...extraProps}
                className={`group flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] ${tone.borderHover}`}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors mb-3 ${tone.iconBg} ${tone.iconText} ${tone.iconBgHover}`}
                >
                  <Icon size={22} />
                </div>
                <span className="text-[13px] font-semibold text-slate-800 leading-tight">
                  {item.label}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 leading-tight">
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
