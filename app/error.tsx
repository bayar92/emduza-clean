'use client';

import { useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[var(--shadow-card)] border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
          <FiAlertTriangle className="text-rose-500" size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Алдаа гарлаа
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Уучлаарай, хүсэлтийг боловсруулах явцад асуудал гарлаа.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Дахин оролдох
        </button>
      </div>
    </div>
  );
}
