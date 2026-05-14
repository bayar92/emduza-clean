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
    <div className="h-screen w-72 bg-white border-r border-gray-100 shadow-sm fixed left-0 top-0 overflow-y-auto flex flex-col z-30">
      {dialog}
      <div className="px-8 py-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
            <Image
              src="/images/full_logo.png"
              width={60}
              height={60}
              alt="Logo"
              className="brightness-0 invert"
            />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 tracking-tight leading-none uppercase">
              ЭМДҮЗ
            </h2>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
              Админ удирдлага
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
          Үндсэн цэс
        </p>

        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-200 relative
                ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {active && (
                <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
              )}
              <Icon
                size={18}
                className={`${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}
              />
              <span>{label}</span>
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
            Тайлан мэдээ
          </p>
          <button
            onClick={() => setOpenMenu(openMenu === 'report' ? '' : 'report')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-200
              ${openMenu === 'report' ? 'bg-gray-50 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <FiPieChart size={18} className="text-gray-400" />
            <span className="flex-1 text-left">Тайлангууд</span>
            {openMenu === 'report' ? (
              <FiChevronUp size={14} className="text-gray-400" />
            ) : (
              <FiChevronDown size={14} className="text-gray-400" />
            )}
          </button>

          {openMenu === 'report' && (
            <div className="mt-1 ml-4 space-y-1 border-l-2 border-gray-100 pl-4 animate-in slide-in-from-top-2 duration-200">
              <Link
                href="/duzadmin/taillan/sankhuu"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
              >
                <FiFileText size={14} />
                <span>Санхүүгийн тайлан</span>
              </Link>
              <Link
                href="/duzadmin/taillan/uil-ajillagaa"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
              >
                <FiFileText size={14} />
                <span>Үйл ажиллагааны тайлан</span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[13px] font-bold text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <div className="bg-red-100 p-2 rounded-lg">
            <FiLogOut size={16} />
          </div>
          <span>Системээс гарах</span>
        </button>
      </div>
    </div>
  );
};

export default AdminNavBar;
