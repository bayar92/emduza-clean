'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { RiArrowDropDownLine, RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import {
  FiInfo,
  FiUsers,
  FiMessageSquare,
  FiFileText,
  FiBarChart2,
  FiDollarSign,
  FiChevronRight,
} from 'react-icons/fi';

/* ─── Nav structure ─────────────────────────────────────── */
const navItems = [
  {
    id: 'about',
    label: 'Бидний тухай',
    children: [
      {
        label: 'ЭМДҮЗ танилцуулга',
        href: '/taniltsuulga',
        icon: FiInfo,
        desc: 'Байгууллагын тухай',
      },
      {
        label: 'Даргын мэндчилгээ',
        href: '/mendchilgee',
        icon: FiMessageSquare,
        desc: 'Удирдлагаас мэндчилгээ',
      },
      {
        label: 'ЭМДҮЗ-ийн гишүүд',
        href: '/gishuud',
        icon: FiUsers,
        desc: 'Зөвлөлийн бүрэлдэхүүн',
      },
      {
        label: 'Ажлын алба',
        href: '/ajliin-alba-taniltsuulga',
        icon: FiInfo,
        desc: 'Ажлын албаны танилцуулга',
      },
    ],
  },
  {
    id: 'news',
    label: 'Мэдээ мэдээлэл',
    children: [
      {
        label: 'Хуралдааны тойм',
        href: '/medee/huraldaanii-toim',
        icon: FiFileText,
        desc: 'ЭМДҮЗ-ийн хуралдаан',
      },
      {
        label: 'Техникийн хороо',
        href: '/medee/technikiin-khoroo',
        icon: FiFileText,
        desc: 'Техникийн хорооны мэдээлэл',
      },
      {
        label: 'Хяналт, үнэлгээ',
        href: '/medee/hynalt-unelgee',
        icon: FiBarChart2,
        desc: 'Хяналт үнэлгээний талаар',
      },
    ],
  },
  {
    id: 'law',
    label: 'Эрх зүй',
    children: [
      {
        label: 'УИХ, Байнгын хорооны шийдвэр',
        href: '/erkhzui/shiidwer',
        icon: FiFileText,
        desc: 'Улсын их хурлын шийдвэр',
      },
      {
        label: 'Засгийн газрын тогтоол',
        href: '/erkhzui/togtool',
        icon: FiFileText,
        desc: 'ЗГ-ын тогтоол',
      },
      {
        label: 'ЭМДҮЗ-ийн тогтоолууд',
        href: '/erkhzui/emduz-togtool',
        icon: FiFileText,
        desc: 'Зөвлөлийн тогтоолууд',
      },
    ],
  },
  {
    id: 'report',
    label: 'Тайлан',
    children: [
      {
        label: 'ЭМД-ын сангийн санхүүгийн тайлан',
        href: '/taillan/sankhuu',
        icon: FiBarChart2,
        desc: 'Санхүүгийн жилийн тайлан',
      },
      {
        label: 'ЭМДҮЗ-ийн үйл ажиллагааны тайлан',
        href: '/taillan/uil-ajillagaa',
        icon: FiBarChart2,
        desc: 'Жилийн үйл ажиллагаа',
      },
    ],
  },
  {
    id: 'dans',
    label: 'Шилэн данс',
    external: true,
    children: [
      {
        label: 'ЭМД сан',
        href: 'https://shilendans.gov.mn/organization/58317',
        icon: FiDollarSign,
        desc: 'ЭМД-ын сан',
        external: true,
      },
      {
        label: 'ЭМДЕГ',
        href: 'https://shilendans.gov.mn/organization/25022',
        icon: FiDollarSign,
        desc: 'ЭМД-ын ерөнхий газар',
        external: true,
      },
      {
        label: 'ЭМДҮЗ',
        href: 'https://shilendans.gov.mn/organization/4984',
        icon: FiDollarSign,
        desc: 'Үндэсний зөвлөл',
        external: true,
      },
    ],
  },
];

/* ─── Main component ─────────────────────────────────────── */
const TopNavBar = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleMouseEnter = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenId(id);
  };
  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpenId(null), 120);
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-[70] h-[5px] bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#2E7D32]" />

      <nav
        className={`fixed top-[5px] left-0 w-full z-[60] transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)] py-2'
            : 'bg-white py-3'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex-shrink-0 transition-transform active:scale-95"
          >
            <Image
              src="/images/logo_2.png"
              alt="ЭМДҮЗ"
              width={scrolled ? 120 : 140}
              height={44}
              priority
              className="transition-all duration-300"
              style={{ height: 'auto' }}
            />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`relative px-4 py-2 text-[13px] font-bold tracking-tight rounded-lg transition-colors ${
                pathname === '/'
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
              }`}
            >
              НҮҮР
              {pathname === '/' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-blue-600 rounded-full" />
              )}
            </Link>

            {navItems.map((item) => {
              const isActive = item.children.some(
                (c) => pathname.startsWith(c.href) && c.href !== '#'
              );
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`relative flex items-center gap-0.5 px-4 py-2 text-[13px] font-bold tracking-tight rounded-lg transition-colors ${
                      isActive || openId === item.id
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="uppercase">{item.label}</span>
                    <RiArrowDropDownLine
                      size={20}
                      className={`transition-transform duration-200 ${openId === item.id ? 'rotate-180' : ''}`}
                    />
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-blue-600 rounded-full" />
                    )}
                  </button>

                  {openId === item.id && (
                    <div
                      className="absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onMouseEnter={() => handleMouseEnter(item.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="absolute -top-[6px] left-6 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45" />
                      {item.children.map((child, i) => {
                        const Icon = child.icon;
                        const isChildActive = pathname === child.href;
                        const isExternal =
                          'external' in child ? child.external : false;
                        const Tag = isExternal ? 'a' : Link;
                        const extraProps = isExternal
                          ? {
                              href: child.href,
                              target: '_blank',
                              rel: 'noopener noreferrer',
                            }
                          : { href: child.href };
                        return (
                          <Tag
                            key={i}
                            {...(extraProps as any)}
                            className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl transition-all group ${
                              isChildActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors ${
                                isChildActive
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                              }`}
                            >
                              <Icon size={14} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[12px] font-bold leading-tight truncate">
                                {child.label}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                                {child.desc}
                              </div>
                            </div>
                            {isExternal && (
                              <FiChevronRight
                                size={12}
                                className="ml-auto text-gray-300 flex-shrink-0"
                              />
                            )}
                          </Tag>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            aria-label="Цэс нээх"
          >
            {mobileOpen ? <RiCloseLine size={24} /> : <RiMenu3Line size={24} />}
          </button>
        </div>

        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-[80vh] border-t border-gray-100' : 'max-h-0'
          }`}
        >
          <div className="bg-white container mx-auto px-4 py-3 overflow-y-auto max-h-[75vh]">
            <Link
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-[13px] font-bold ${
                pathname === '/'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              НҮҮР
            </Link>

            {navItems.map((item) => (
              <MobileAccordion
                key={item.id}
                item={item}
                pathname={pathname}
                openId={openId}
                setOpenId={setOpenId}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="h-[72px]" />
    </>
  );
};

/* ─── Mobile accordion ───────────────────────────────────── */
const MobileAccordion = ({
  item,
  pathname,
  openId,
  setOpenId,
}: {
  item: (typeof navItems)[number];
  pathname: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) => {
  const isOpen = openId === item.id;
  const isActive = item.children.some(
    (c) => pathname.startsWith(c.href) && c.href !== '#'
  );

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpenId(isOpen ? null : item.id)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span className="uppercase">{item.label}</span>
        <RiArrowDropDownLine
          size={22}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-gray-400'}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="pl-4 pr-2 pb-2 space-y-1">
          {item.children.map((child, i) => {
            const Icon = child.icon;
            const isChildActive = pathname === child.href;
            const isExternal =
              'external' in child ? child.external : false;
            const Tag = isExternal ? 'a' : Link;
            const extraProps = isExternal
              ? {
                  href: child.href,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }
              : { href: child.href };

            return (
              <Tag
                key={i}
                {...(extraProps as any)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-colors ${
                  isChildActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg ${
                    isChildActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Icon size={13} />
                </div>
                {child.label}
              </Tag>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopNavBar;
