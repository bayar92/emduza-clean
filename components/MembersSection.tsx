'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Member {
  id: number;
  name: string;
  position: string;
  image?: string;
}

interface ArrowProps {
  onClick?: () => void;
}

const normPath = (p: string) => (p && !p.startsWith('/') ? `/${p}` : p);

const getPositionColor = (pos: string) => {
  if (pos.includes('Засгийн газар')) return 'text-blue-500';
  if (pos.includes('Даатгуулагч')) return 'text-purple-500';
  if (pos.includes('Ажил олгогч')) return 'text-orange-500';
  return 'text-blue-400';
};

const NextArrow = ({ onClick }: ArrowProps) => (
  <button
    className="absolute -top-10 right-0 cursor-pointer bg-white border border-gray-100 text-gray-400 hover:bg-blue-600 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-sm transition-all z-20 active:scale-95"
    onClick={onClick}
  >
    <FiChevronRight size={18} />
  </button>
);

const PrevArrow = ({ onClick }: ArrowProps) => (
  <button
    className="absolute -top-10 right-10 cursor-pointer bg-white border border-gray-100 text-gray-400 hover:bg-blue-600 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-sm transition-all z-20 active:scale-95"
    onClick={onClick}
  >
    <FiChevronLeft size={18} />
  </button>
);

const MembersSection = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get('/api/members');
        setMembers(response.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const settings = {
    dots: false,
    infinite: members.length > 5,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 640, settings: { slidesToShow: 2 } },
    ],
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mb-10" />
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/3.8] bg-gray-100 rounded-2xl" />
                <div className="h-3 bg-gray-100 rounded mt-3 mx-4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (members.length === 0) return null;

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="relative mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                Зөвлөлийн гишүүд
              </h2>
            </div>
            <Link
              href="/gishuud"
              className="flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Бүгдийг харах <FiArrowRight size={13} />
            </Link>
          </div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.1em] mt-1 ml-5">
            Бүрэлдэхүүн хэсэг
          </p>
        </div>

        <Slider {...settings} className="member-slider -mx-3">
          {members.map((member) => (
            <div key={member.id} className="px-3 outline-none">
              <div
                onClick={() => router.push('/gishuud')}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/3.8] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 transition-all duration-500 group-hover:shadow-lg group-hover:-translate-y-1">
                  <img
                    src={
                      member.image && member.image !== ''
                        ? normPath(member.image)
                        : '/images/placeholder-member.jpg'
                    }
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 right-3">
                    <span className="text-[9px] font-black text-white/80 uppercase tracking-tight line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {member.position}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full p-3 text-center">
                    <h3 className="text-white text-[11px] font-bold leading-tight uppercase tracking-tight">
                      {member.name}
                    </h3>
                  </div>
                </div>

                <div className="mt-2.5 px-1 text-center">
                  <p
                    className={`text-[9px] font-bold uppercase tracking-tighter leading-tight opacity-70 group-hover:opacity-100 transition-opacity ${getPositionColor(member.position)}`}
                  >
                    {member.position}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <style jsx global>{`
        .member-slider .slick-list {
          overflow: visible;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
      `}</style>
    </section>
  );
};

export default MembersSection;
