"use client";

import { FiCheck } from "react-icons/fi";

export default function SuccessModal({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeSlide"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-[var(--shadow-modal)] w-full max-w-sm p-6 text-center"
      >
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
          <FiCheck className="text-emerald-600" size={26} />
        </div>
        <p className="text-[15px] font-medium text-slate-800 mb-6 leading-relaxed">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}
