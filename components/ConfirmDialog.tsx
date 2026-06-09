'use client';

import { FiAlertTriangle, FiInfo } from 'react-icons/fi';

type Variant = 'confirm' | 'alert';

export default function ConfirmDialog({
  open,
  message,
  variant = 'confirm',
  confirmLabel = 'Тийм',
  cancelLabel = 'Үгүй',
  okLabel = 'OK',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  variant?: Variant;
  confirmLabel?: string;
  cancelLabel?: string;
  okLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  if (!open) return null;

  const isConfirm = variant === 'confirm';
  const Icon = isConfirm ? FiAlertTriangle : FiInfo;
  const accentBg = isConfirm ? 'bg-rose-50' : 'bg-brand-50';
  const accentText = isConfirm ? 'text-rose-500' : 'text-brand-600';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeSlide"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-[var(--shadow-modal)] w-full max-w-sm p-6 text-center"
      >
        <div className={`w-14 h-14 mx-auto mb-4 rounded-full ${accentBg} flex items-center justify-center`}>
          <Icon className={accentText} size={26} />
        </div>
        <p className="text-[15px] font-medium text-slate-800 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-2">
          {isConfirm && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
              isConfirm ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {isConfirm ? confirmLabel : okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
