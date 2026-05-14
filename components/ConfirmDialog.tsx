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
  const accentBg = isConfirm ? 'bg-red-50' : 'bg-blue-50';
  const accentText = isConfirm ? 'text-red-500' : 'text-blue-500';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
      >
        <div className={`w-14 h-14 mx-auto mb-4 rounded-full ${accentBg} flex items-center justify-center`}>
          <Icon className={accentText} size={26} />
        </div>
        <p className="text-[15px] font-semibold text-gray-800 mb-6 leading-snug">
          {message}
        </p>
        <div className="flex gap-2">
          {isConfirm && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-colors ${
              isConfirm ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isConfirm ? confirmLabel : okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
