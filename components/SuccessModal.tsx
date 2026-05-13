"use client";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-80 text-center">
        <p className="text-lg font-medium mb-4 text-gray-800">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          OK
        </button>
      </div>
    </div>
  );
}
