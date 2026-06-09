import Link from 'next/link';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export const metadata = {
  title: '404 — Хуудас олдсонгүй',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-[120px] font-black text-blue-600 leading-none tracking-tight mb-2">
          404
        </div>
        <div className="w-16 h-1 bg-blue-600 rounded-full mx-auto mb-6" />
        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-3">
          Хуудас олдсонгүй
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Таны хайсан хуудас зөөгдсөн эсвэл хасагдсан байж магадгүй.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            <FiHome size={16} />
            Нүүр хуудас
          </Link>
          <Link
            href="/medee"
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl border border-gray-200 transition-colors"
          >
            <FiArrowLeft size={16} />
            Мэдээ үзэх
          </Link>
        </div>
      </div>
    </div>
  );
}
