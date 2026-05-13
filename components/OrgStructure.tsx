'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiExternalLink, FiArrowRight } from 'react-icons/fi';

const orgs = [
  {
    href: 'https://emduz.gov.mn/',
    img: '/images/full_logo.png',
    name: 'Эрүүл мэндийн даатгалын үндэсний зөвлөл',
    desc: 'Эрүүл мэндийн даатгалын тогтолцоог удирдан зохицуулж, бодлого боловсруулах чиг үүрэг бүхий үндэсний зөвлөл.',
    tag: 'Удирдах байгууллага',
    tagColor: 'bg-blue-600',
    accentBorder: 'border-t-blue-600',
    accentText: 'text-blue-600',
  },
  {
    href: 'https://moh.gov.mn/',
    img: '/images/yam_logo.png',
    name: 'Эрүүл мэндийн яам',
    desc: 'Монгол улсын эрүүл мэндийн салбарын бодлого, хяналт, зохицуулалтыг хариуцан ажилладаг төрийн захиргааны байгууллага.',
    tag: 'Харьяа яам',
    tagColor: 'bg-green-600',
    accentBorder: 'border-t-green-500',
    accentText: 'text-green-600',
  },
  {
    href: 'https://emd.gov.mn/',
    img: '/images/002.jpg',
    name: 'Эрүүл мэндийн даатгалын ерөнхий газар',
    desc: 'Эрүүл мэндийн даатгалын үйлчилгээг хэрэгжүүлэх, санхүүжүүлэх, хяналт тавих чиг үүрэг бүхий байгууллага.',
    tag: 'Харьяа газар',
    tagColor: 'bg-purple-600',
    accentBorder: 'border-t-purple-500',
    accentText: 'text-purple-600',
  },
];

const OrgStructure = () => {
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="w-8 h-[3px] bg-green-500 rounded-full" />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">
              Байгууллагын тогтолцоо
            </h2>
            <span className="w-8 h-[3px] bg-green-500 rounded-full" />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            Хамтран ажиллагч болон харьяа байгууллагуудын бүтэц
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch justify-center gap-0 max-w-5xl mx-auto">
          {orgs.map((org, i) => (
            <React.Fragment key={i}>
              <Link
                href={org.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex-1 relative bg-white border border-gray-100 border-t-4 ${org.accentBorder} rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col p-6 overflow-hidden min-w-0`}
              >
                <span
                  className={`self-start inline-block px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider mb-5 ${org.tagColor}`}
                >
                  {org.tag}
                </span>

                <div className="relative h-12 w-full mb-5">
                  <Image
                    src={org.img}
                    alt={org.name}
                    fill
                    className="object-contain object-left transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <h3 className="text-[13px] font-black text-gray-800 leading-snug mb-2 group-hover:text-blue-700 transition-colors">
                  {org.name}
                </h3>

                <p className="text-[11px] text-gray-500 leading-relaxed font-medium flex-1">
                  {org.desc}
                </p>

                <div
                  className={`mt-5 flex items-center gap-1.5 text-[11px] font-bold transition-colors ${org.accentText} opacity-70 group-hover:opacity-100`}
                >
                  <FiExternalLink size={11} />
                  Вэбсайт үзэх
                </div>
              </Link>

              {i < orgs.length - 1 && (
                <div className="flex items-center justify-center flex-shrink-0">
                  <div className="hidden md:flex items-center gap-0 px-2">
                    <div className="w-6 h-px bg-gray-300" />
                    <FiArrowRight size={16} className="text-gray-300 -ml-1" />
                  </div>

                  <div className="md:hidden flex flex-col items-center py-2">
                    <div className="w-px h-6 bg-gray-200" />
                    <FiArrowRight
                      size={14}
                      className="text-gray-300 rotate-90 -mt-1"
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrgStructure;
