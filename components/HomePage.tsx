import React from 'react';
import Image from 'next/image';

import FeaturedNews from './FeaturedNews';
import VideoNews from './VideoNews';
import MembersSection from './MembersSection';
import QuickLinks from './QuickLinks';
import StatsSection from './StatsSection';
import RecentDocuments from './RecentDocuments';
import OrgStructure from './OrgStructure';

const HomePage = () => {
  return (
    <div className="w-full bg-[#F8FAFC]">
      <header className="relative w-full overflow-hidden">
        <div className="max-w-[1920px] mx-auto relative">
          <Image
            src="/images/cover_1.jpg"
            alt="ЭМДҮЗ Cover"
            width={1920}
            height={500}
            className="w-full h-[320px] md:h-[440px] lg:h-[520px] object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />

          <div className="absolute inset-0 z-20 flex items-center">
            <div className="container mx-auto px-6 lg:px-20">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-[3px] bg-blue-400 rounded-full" />
                  <span className="text-blue-300 text-[11px] font-black uppercase tracking-[0.3em]">
                    Монгол улс
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-lg">
                  Эрүүл мэндийн <br />
                  даатгалын{' '}
                  <span className="text-blue-400">үндэсний зөвлөл</span>
                </h1>

                <p className="mt-4 text-sm md:text-base text-gray-200 font-medium max-w-md hidden md:block opacity-90 leading-relaxed">
                  Монгол улсын иргэн бүрийн эрүүл мэндийн төлөөх чанартай,
                  хүртээмжтэй тогтолцоо.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-gray-100">
        <QuickLinks />
      </div>

      <div className="py-2">
        <div className="container mx-auto px-6">
          <FeaturedNews />
        </div>
      </div>
      <StatsSection />

      <div className="bg-white py-4 shadow-sm border-y border-gray-100">
        <div className="container mx-auto px-6">
          <VideoNews />
        </div>
      </div>

      <RecentDocuments />
      <OrgStructure />

      <div className="pb-8">
        <MembersSection />
      </div>
    </div>
  );
};

export default HomePage;
