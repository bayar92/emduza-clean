import { prisma } from '@/utils/prisma';
import TopNavBar from '@/components/TopNavBar';
import FooterNavBar from '@/components/FooterNavBar';
import Link from 'next/link';
import { FiPieChart, FiChevronRight } from 'react-icons/fi';
import ReportList from '../ReportList';

export const dynamic = 'force-dynamic';

const subLinks = [
  { href: '/taillan/sankhuu', label: 'Санхүүгийн тайлан' },
  {
    href: '/taillan/uil-ajillagaa',
    label: 'Үйл ажиллагааны тайлан',
    active: true,
  },
];

export default async function UilAjillagaaPage() {
  const reports = await prisma.report.findMany({
    where: { type: 'activity' },
    orderBy: { year: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopNavBar />

      <div className="bg-gradient-to-br from-[#0D47A1] to-[#1565C0] p-6  relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full bg-white/5" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-blue-200 text-[11px] font-bold mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Нүүр
            </Link>
            <FiChevronRight size={11} />
            <span className="text-white">Үйл ажиллагааны тайлан</span>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <FiPieChart size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                Үйл ажиллагааны тайлан
              </h1>
              <p className="text-blue-200 text-sm mt-1 font-medium">
                ЭМДҮЗ-ийн жилийн үйл ажиллагааны тайлан
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {subLinks.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-colors ${
                  s.active
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6 bg-blue-600 rounded-full" />
            <div>
              <h2 className="text-[16px] font-black text-gray-900 uppercase tracking-tight">
                Үйл ажиллагааны тайлан
              </h2>
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.15em]">
                Нийт {reports.length} тайлан
              </p>
            </div>
          </div>
          <ReportList reports={reports} />
        </div>
      </div>

      <FooterNavBar />
    </div>
  );
}
