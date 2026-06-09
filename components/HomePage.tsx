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
    <div className="w-full bg-slate-50">
      <header className="relative w-full overflow-hidden">
        <div className="max-w-[1920px] mx-auto relative">
          <Image
            src="/images/cover_1.jpg"
            alt="ЭМДҮЗ Cover"
            width={1920}
            height={520}
            className="w-full h-[340px] md:h-[460px] lg:h-[540px] object-cover object-center"
            priority
          />
          {/* Deeper, more legible gradient overlay than the previous double-stack */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/85 via-brand-900/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 to-transparent z-10" />

          <div className="absolute inset-0 z-20 flex items-center">
            <div className="container mx-auto px-6 lg:px-20">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-[2px] bg-brand-300 rounded-full" />
                  <span className="text-brand-200 text-[11px] font-semibold uppercase tracking-[0.22em]">
                    Монгол улс
                  </span>
                </div>

                <h1 className="text-[34px] md:text-5xl lg:text-[56px] font-extrabold text-white leading-[1.1] tracking-tight">
                  Эрүүл мэндийн<br />
                  даатгалын{' '}
                  <span className="text-brand-300">үндэсний зөвлөл</span>
                </h1>

                <p className="mt-5 text-[15px] md:text-base text-white/85 max-w-md hidden md:block leading-relaxed">
                  Монгол улсын иргэн бүрийн эрүүл мэндийн төлөөх чанартай,
                  хүртээмжтэй тогтолцоо.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-100">
        <QuickLinks />
      </div>

      <div className="py-2">
        <div className="container mx-auto px-6">
          <FeaturedNews />
        </div>
      </div>
      <StatsSection />

      <div className="bg-white py-4 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <VideoNews />
        </div>
      </div>

      <RecentDocuments />
      <OrgStructure />

      <div className="pb-12">
        <MembersSection />
      </div>
    </div>
  );
};

export default HomePage;
