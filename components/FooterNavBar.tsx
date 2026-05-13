'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
} from 'react-icons/fa';

const FooterNavBar = () => {
  return (
    <footer className="bg-gradient-to-br from-[#0D47A1] to-[#1565C0] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="container mx-auto px-6 pt-16 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg">
                <Image
                  src="/images/logo_2.png"
                  width={200}
                  height={200}
                  alt="Logo"
                  className="object-contain"
                  style={{ height: 'auto' }}
                />
              </div>
              {/* <div>
                <h2 className="text-sm font-black tracking-tighter uppercase leading-none">
                  ЭМДҮЗ
                </h2>
                <p className="text-[10px] text-blue-200 font-bold uppercase mt-1">
                  Үндэсний зөвлөл
                </p>
              </div> */}
            </div>
            <p className="text-blue-100 text-[13px] leading-relaxed font-medium pr-4">
              Эрүүл мэндийн даатгалын тогтолцоог бэхжүүлж, иргэн бүрт чанартай
              тусламж үйлчилгээг хүргэхэд бид манлайлан ажиллана.
            </p>
          </div>

          <div>
            <h3 className="text-white text-ml font-black uppercase tracking-[0.2em] mb-8 border-l-2 border-white/40 pl-4">
              Цэс
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Нүүр хуудас', href: '/' },
                { name: 'Бидний тухай', href: '/taniltsuulga' },
                { name: 'Зөвлөлийн гишүүд', href: '/gishuud' },
                { name: 'Мэдээ мэдээлэл', href: '/medee' },
                { name: 'Эрх зүй', href: '/erkhzui' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-[14px] text-blue-100 font-medium hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-white/50 rounded-full flex-shrink-0" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white text-mk font-black uppercase tracking-[0.2em] mb-8 border-l-2 border-white/40 pl-4">
              Шилэн данс
            </h3>
            <ul className="space-y-3">
              {[
                {
                  name: 'ЭМД-ын сан',
                  href: 'https://shilendans.gov.mn/organization/58317',
                },
                {
                  name: 'ЭМД-ын ерөнхий газар',
                  href: 'https://shilendans.gov.mn/organization/25022',
                },
                {
                  name: 'ЭМД-ын үндэсний зөвлөл',
                  href: 'https://shilendans.gov.mn/organization/4984',
                },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    target="_blank"
                    className="text-[14px] text-blue-100 font-medium hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-white/50 rounded-full flex-shrink-0" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white text-ml font-black uppercase tracking-[0.2em] mb-8 border-l-2 border-white/40 pl-4">
              Холбоо барих
            </h3>

            <div className="space-y-4 mb-8">
              {[
                {
                  icon: FaMapMarkerAlt,
                  value: 'Union Building C блок, 7 давхар 708 тоот',
                },
                { icon: FaPhoneAlt, value: '77135051' },
                { icon: FaEnvelope, value: 'emduz2025@gmail.com' },
                { icon: FaClock, value: 'Да — Ба, 09:00 – 18:00' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="bg-white/15 p-2.5 rounded-xl group-hover:bg-white/30 transition-colors flex-shrink-0">
                      <Icon
                        size={12}
                        className="text-white/70 group-hover:text-white"
                      />
                    </div>
                    <p className="text-[14px] text-blue-100 font-medium leading-snug pt-1">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              {[
                { icon: FaFacebookF, href: '#' },
                { icon: FaTwitter, href: '#' },
                { icon: FaLinkedinIn, href: '#' },
                { icon: FaInstagram, href: '#' },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="w-9 h-9 flex items-center justify-center bg-white/15 rounded-xl hover:bg-white/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <social.icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-blue-200 font-bold uppercase tracking-widest">
            &copy; 2026 Эрүүл мэндийн даатгалын үндэсний зөвлөл
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterNavBar;
