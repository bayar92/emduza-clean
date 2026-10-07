'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  FiFolder,
} from 'react-icons/fi';

import {
  buildMenuTree,
  pageHref,
  type CustomMenuPage,
  type MenuNode,
} from '@/utils/menuPages';

const STANDALONE_LINKS = [{ href: '/sanal-khuselt', label: 'Санал хүсэлт' }];

/* ─── Nav structure ─────────────────────────────────────── */
// Keep the group ids in sync with BUILTIN_MENUS in utils/menuPages.ts — they
// are the choices offered when an admin places a custom page in the menu.
type NavChild = {
  label: string;
  /** Absent on a sub-menu (group), which only holds `children`. */
  href?: string;
  icon: React.ElementType;
  desc?: string;
  external?: boolean;
  /** Present on an admin-created sub-menu: opens a flyout / nested accordion. */
  children?: NavChild[];
};
type NavGroup = {
  id: string;
  label: string;
  external?: boolean;
  children: NavChild[];
};

const navItems: NavGroup[] = [
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

/* ─── Helpers ────────────────────────────────────────────── */
const nodeToChild = (n: MenuNode): NavChild =>
  n.kind === 'group'
    ? { label: n.title, icon: FiFolder, children: n.children.map(nodeToChild) }
    : { label: n.title, href: pageHref(n.slug ?? ''), icon: FiFileText };

/** Is the current page this entry, or anything inside it? */
const isChildActive = (c: NavChild, pathname: string): boolean =>
  c.children
    ? c.children.some((x) => isChildActive(x, pathname))
    : !!c.href && pathname === c.href;

/** Looser match used for the top-level highlight (prefix, as before). */
const isGroupActive = (children: NavChild[], pathname: string): boolean =>
  children.some((c) =>
    c.children
      ? isGroupActive(c.children, pathname)
      : !!c.href && c.href !== '#' && pathname.startsWith(c.href)
  );

const linkProps = (child: NavChild) =>
  child.external
    ? { href: child.href ?? '#', target: '_blank', rel: 'noopener noreferrer' }
    : { href: child.href ?? '#' };

/* ─── Main component ─────────────────────────────────────── */
const TopNavView = ({
  customPages = [],
}: {
  /** Admin-created menu entries (see /duzadmin/tses). */
  customPages?: CustomMenuPage[];
}) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Merge admin-created entries into the built-in structure: entries placed in
  // a built-in dropdown are appended to it; new top-level groups become
  // dropdowns of their own; top-level pages become plain links.
  const { groups, standaloneLinks } = useMemo(() => {
    const { topLevel, byBuiltin } = buildMenuTree(customPages);
    const builtIn: NavGroup[] = navItems.map((g) => ({
      ...g,
      children: [...g.children, ...(byBuiltin[g.id] ?? []).map(nodeToChild)],
    }));
    const customGroups: NavGroup[] = topLevel
      .filter((n) => n.kind === 'group')
      .map((n) => ({
        id: `custom-${n.id}`,
        label: n.title,
        children: n.children.map(nodeToChild),
      }));
    const customLinks = topLevel
      .filter((n) => n.kind === 'page')
      .map((n) => ({ href: pageHref(n.slug ?? ''), label: n.title }));
    return {
      groups: [...builtIn, ...customGroups],
      standaloneLinks: [...STANDALONE_LINKS, ...customLinks],
    };
  }, [customPages]);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Dropdowns are 18rem wide. Entries added by admins land at the end of the
  // bar, so open the dropdown towards the left when it would run off screen.
  const [alignRight, setAlignRight] = useState(false);
  const handleMouseEnter = (id: string, anchor?: HTMLElement) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (anchor) {
      setAlignRight(anchor.getBoundingClientRect().left + 288 > window.innerWidth - 8);
    }
    setOpenId(id);
  };
  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpenId(null), 120);
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-[70] h-[3px] bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500" />

      <nav
        className={`fixed top-[3px] left-0 w-full z-[60] transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[var(--shadow-nav)] py-2'
            : 'bg-white py-3 border-b border-slate-100'
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
              width={scrolled ? 118 : 134}
              height={44}
              priority
              className="transition-all duration-300"
              style={{ height: 'auto' }}
            />
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            <Link
              href="/"
              className={`relative px-3.5 py-2 text-[13px] font-semibold rounded-md transition-colors ${
                pathname === '/'
                  ? 'text-brand-700 bg-brand-50'
                  : 'text-slate-600 hover:text-brand-700 hover:bg-slate-50'
              }`}
            >
              Нүүр
              {pathname === '/' && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-brand-600 rounded-full" />
              )}
            </Link>

            {groups.map((item) => {
              const isActive = isGroupActive(item.children, pathname);
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={(e) => handleMouseEnter(item.id, e.currentTarget)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`relative flex items-center gap-0.5 px-3.5 py-2 text-[13px] font-semibold rounded-md transition-colors ${
                      isActive || openId === item.id
                        ? 'text-brand-700 bg-brand-50'
                        : 'text-slate-600 hover:text-brand-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <RiArrowDropDownLine
                      size={20}
                      className={`transition-transform duration-200 ${openId === item.id ? 'rotate-180' : ''}`}
                    />
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-brand-600 rounded-full" />
                    )}
                  </button>

                  {openId === item.id && (
                    <div
                      className={`absolute top-full ${alignRight ? 'right-0' : 'left-0'} mt-2 w-72 bg-white rounded-2xl shadow-[var(--shadow-modal)] border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150`}
                      onMouseEnter={() => handleMouseEnter(item.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div
                        className={`absolute -top-[6px] ${alignRight ? 'right-6' : 'left-6'} w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45`}
                      />
                      {item.children.map((child, i) => (
                        <DesktopChild key={i} child={child} pathname={pathname} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {standaloneLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 text-[13px] font-semibold rounded-md transition-colors ${
                  pathname === link.href
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-slate-600 hover:text-brand-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-brand-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Цэс нээх"
          >
            {mobileOpen ? <RiCloseLine size={24} /> : <RiMenu3Line size={24} />}
          </button>
        </div>

        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-[80vh] border-t border-slate-100' : 'max-h-0'
          }`}
        >
          <div className="bg-white container mx-auto px-4 py-3 overflow-y-auto max-h-[75vh]">
            <Link
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-[13px] font-semibold ${
                pathname === '/'
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Нүүр
            </Link>

            {groups.map((item) => (
              <MobileAccordion
                key={item.id}
                item={item}
                pathname={pathname}
                openId={openId}
                setOpenId={setOpenId}
              />
            ))}

            {standaloneLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-[13px] font-semibold ${
                  pathname === link.href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="h-[72px]" />
    </>
  );
};

/* ─── Desktop dropdown row (recursive: sub-menus open a flyout) ──────────── */
const DesktopChild = ({
  child,
  pathname,
}: {
  child: NavChild;
  pathname: string;
}) => {
  const [open, setOpen] = useState(false);
  const [flip, setFlip] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const Icon = child.icon;
  const active = isChildActive(child, pathname);

  const iconBox = (
    <div
      className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg transition-colors ${
        active
          ? 'bg-brand-100 text-brand-600'
          : 'bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600'
      }`}
    >
      <Icon size={15} />
    </div>
  );

  if (child.children) {
    const enter = () => {
      // Open towards the left when there is no room on the right.
      const r = rowRef.current?.getBoundingClientRect();
      setFlip(!!r && r.right + 296 > window.innerWidth);
      setOpen(true);
    };
    return (
      <div
        ref={rowRef}
        className="relative mx-1.5"
        onMouseEnter={enter}
        onMouseLeave={() => setOpen(false)}
      >
        <div
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-default transition-colors ${
            open || active ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
          }`}
        >
          {iconBox}
          <div className="min-w-0 flex-1 text-[13px] font-semibold leading-tight truncate">
            {child.label}
          </div>
          <FiChevronRight size={14} className="text-slate-400 flex-shrink-0" />
        </div>

        {open && (
          // The padding on the near side bridges the gap so the pointer can
          // travel into the flyout without leaving the hovered row.
          <div
            className={`absolute top-0 z-50 ${
              flip ? 'right-full pr-1.5' : 'left-full pl-1.5'
            }`}
          >
            <div className="w-72 bg-white rounded-2xl shadow-[var(--shadow-modal)] border border-slate-100 py-2">
              {child.children.map((c, i) => (
                <DesktopChild key={i} child={c} pathname={pathname} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const Tag = child.external ? 'a' : Link;
  return (
    <Tag
      {...linkProps(child)}
      className={`flex items-center gap-3 mx-1.5 px-3 py-2.5 rounded-xl transition-colors group ${
        active ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50 text-slate-700'
      }`}
    >
      {iconBox}
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold leading-tight truncate">
          {child.label}
        </div>
        {child.desc && (
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            {child.desc}
          </div>
        )}
      </div>
      {child.external && (
        <FiChevronRight
          size={13}
          className="ml-auto text-slate-300 flex-shrink-0"
        />
      )}
    </Tag>
  );
};

/* ─── Mobile accordion (recursive) ───────────────────────── */
const MobileAccordion = ({
  item,
  pathname,
  openId,
  setOpenId,
}: {
  item: NavGroup;
  pathname: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) => {
  const isOpen = openId === item.id;
  const isActive = isGroupActive(item.children, pathname);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpenId(isOpen ? null : item.id)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-semibold transition-colors ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-700 hover:bg-slate-50'
        }`}
      >
        <span>{item.label}</span>
        <RiArrowDropDownLine
          size={22}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-600' : 'text-slate-400'}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[1500px]' : 'max-h-0'}`}
      >
        <MobileChildren items={item.children} pathname={pathname} depth={0} />
      </div>
    </div>
  );
};

const MobileChildren = ({
  items,
  pathname,
  depth,
}: {
  items: NavChild[];
  pathname: string;
  depth: number;
}) => (
  <div className={`${depth === 0 ? 'pl-4' : 'pl-3'} pr-2 pb-2 space-y-1`}>
    {items.map((child, i) =>
      child.children ? (
        <MobileSubGroup key={i} child={child} pathname={pathname} depth={depth} />
      ) : (
        <MobileLeaf key={i} child={child} pathname={pathname} />
      )
    )}
  </div>
);

const MobileSubGroup = ({
  child,
  pathname,
  depth,
}: {
  child: NavChild;
  pathname: string;
  depth: number;
}) => {
  const [open, setOpen] = useState(false);
  const Icon = child.icon;
  const active = isChildActive(child, pathname);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
          active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        <div
          className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg ${
            active ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Icon size={13} />
        </div>
        <span className="flex-1 text-left">{child.label}</span>
        <RiArrowDropDownLine
          size={20}
          className={`transition-transform duration-200 ${open ? 'rotate-180 text-brand-600' : 'text-slate-400'}`}
        />
      </button>
      {open && child.children && (
        <MobileChildren items={child.children} pathname={pathname} depth={depth + 1} />
      )}
    </div>
  );
};

const MobileLeaf = ({
  child,
  pathname,
}: {
  child: NavChild;
  pathname: string;
}) => {
  const Icon = child.icon;
  const active = isChildActive(child, pathname);
  const Tag = child.external ? 'a' : Link;

  return (
    <Tag
      {...linkProps(child)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
        active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <div
        className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg ${
          active ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <Icon size={13} />
      </div>
      {child.label}
    </Tag>
  );
};

export default TopNavView;
