'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiInfo, FiMessageSquare, FiUsers, FiBriefcase } from 'react-icons/fi';

const menuItems = [
  { id: '1', label: 'ЭМДҮЗ Танилцуулга', href: '/taniltsuulga', icon: FiInfo },
  { id: '2', label: 'Даргын мэндчилгээ', href: '/mendchilgee', icon: FiMessageSquare },
  { id: '3', label: 'Зөвлөлийн гишүүд', href: '/gishuud', icon: FiUsers },
  { id: '4', label: 'Ажлын алба', href: '/ajliin-alba-taniltsuulga', icon: FiBriefcase },
];

const SidebarMenu = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Бидний тухай
          </p>
        </div>
        <nav className="p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all mb-0.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-white' : 'text-gray-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default SidebarMenu;
