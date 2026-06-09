import Link from 'next/link';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export const metadata = {
  title: '404 — Хуудас олдсонгүй',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-[128px] font-extrabold text-brand-600 leading-none tracking-tighter mb-3">
          404
        </div>
        <div className="w-16 h-0.5 bg-brand-600 rounded-full mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          Хуудас олдсонгүй
        </h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Таны хайсан хуудас зөөгдсөн эсвэл хасагдсан байж магадгүй.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <FiHome size={16} />
            Нүүр хуудас
          </Link>
          <Link
            href="/medee"
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            <FiArrowLeft size={16} />
            Мэдээ үзэх
          </Link>
        </div>
      </div>
    </div>
  );
}
