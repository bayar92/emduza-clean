import TopNavBar from '@/components/TopNavBar';
import FooterNavBar from '@/components/FooterNavBar';
import SidebarMenu from '@/components/SideBarMenu';
import { prisma } from '@/utils/prisma';
import IntroClient from './IntroClient';
import { FiInfo } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const intro = await prisma.introduction.findFirst();

  return (
    <>
      <TopNavBar />

      <div className="bg-gradient-to-br from-[#0D47A1] to-[#1565C0] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="container mx-auto px-6 py-12 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <FiInfo size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                ЭМДҮЗ Танилцуулга
              </h1>
              <p className="text-blue-200 text-sm font-medium mt-1">
                Эрүүл мэндийн даатгалын үндэсний зөвлөлийн тухай
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="container mx-auto px-6 py-10">
          <div className="flex gap-8 items-start">
            <SidebarMenu />

            <main className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10">
              {intro ? (
                <IntroClient intro={intro} />
              ) : (
                <div className="py-16 text-center text-gray-400 text-sm">
                  Танилцуулгын мэдээлэл байхгүй байна
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <FooterNavBar />
    </>
  );
}
