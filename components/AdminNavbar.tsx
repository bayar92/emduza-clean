'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';
import { useDialog } from './useDialog';
import {
  FiHome,
  FiClipboard,
  FiUsers,
  FiLayers,
  FiDatabase,
  FiVideo,
  FiArchive,
  FiPieChart,
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiActivity,
} from 'react-icons/fi';

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/duzadmin', icon: FiActivity, label: 'Дашбоард' },
  { href: '/duzadmin/mendchilgee', icon: FiHome, label: 'Даргын мэндчилгээ' },
  {
    href: '/duzadmin/emduzTaniltsuulga',
    icon: FiClipboard,
    label: 'ЭМДҮЗ танилцуулга',
  },
  {
    href: '/duzadmin/emduzGishuud',
    icon: FiUsers,
    label: 'Гишүүдийн танилцуулга',
  },
  {
    href: '/duzadmin/aaTaniltsuulga',
    icon: FiArchive,
    label: 'Ажлын албаны танилцуулга',
  },
  { href: '/duzadmin/shiidwer', icon: FiLayers, label: 'Эрх зүй' },
  { href: '/duzadmin/medee', icon: FiDatabase, label: 'Мэдээ мэдээлэл' },
  { href: '/duzadmin/VideoMedee', icon: FiVideo, label: 'Видео мэдээ' },
];

const AdminNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState('');
  const { confirm, dialog } = useDialog();

  const handleLogout = async () => {
    if (!(await confirm('Системээс гарах уу?'))) return;
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isActive = (href: string) => {
    if (href === '/duzadmin') return pathname === '/duzadmin';
    return pathname.startsWith(href);
  };

  return (
    <div className="h-screen w-72 bg-white border-r border-slate-100 fixed left-0 top-0 overflow-y-auto flex flex-col z-30">
      {dialog}
      <div className="px-6 py-7 mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-brand-600 p-2 rounded-xl">
            <Image
              src="/images/full_logo.png"
              width={56}
              height={56}
              alt="Logo"
              className="brightness-0 invert"
            />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 tracking-tight leading-none">
              ЭМДҮЗ
            </h2>
            <p className="eyebrow mt-1.5">Админ удирдлага</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        <p className="eyebrow px-3 mb-3">Үндсэн цэс</p>

        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors relative
                ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {active && (
                <div className="absolute left-0 w-0.5 h-5 bg-brand-600 rounded-r-full" />
              )}
              <Icon
                size={17}
                className={`${active ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`}
              />
              <span>{label}</span>
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="eyebrow px-3 mb-3">Тайлан мэдээ</p>
          <button
            onClick={() => setOpenMenu(openMenu === 'report' ? '' : 'report')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors
              ${openMenu === 'report' ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <FiPieChart size={17} className="text-slate-400" />
            <span className="flex-1 text-left">Тайлангууд</span>
            {openMenu === 'report' ? (
              <FiChevronUp size={14} className="text-slate-400" />
            ) : (
              <FiChevronDown size={14} className="text-slate-400" />
            )}
          </button>

          {openMenu === 'report' && (
            <div className="mt-1 ml-4 space-y-0.5 border-l border-slate-100 pl-3 animate-in slide-in-from-top-2 duration-200">
              <Link
                href="/duzadmin/taillan/sankhuu"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-brand-700 hover:bg-brand-50 transition-colors"
              >
                <FiFileText size={13} />
                <span>Санхүүгийн тайлан</span>
              </Link>
              <Link
                href="/duzadmin/taillan/uil-ajillagaa"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:text-brand-700 hover:bg-brand-50 transition-colors"
              >
                <FiFileText size={13} />
                <span>Үйл ажиллагааны тайлан</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="p-3 mt-auto border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <div className="bg-rose-100 p-1.5 rounded-lg">
            <FiLogOut size={15} />
          </div>
          <span>Системээс гарах</span>
        </button>
      </div>
    </div>
  );
};

export default AdminNavBar;
