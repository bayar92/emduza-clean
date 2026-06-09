'use client';

import { useState } from 'react';
import useSWR from 'swr';
import withAuth from '@/components/withAuth';
import { useDialog } from '@/components/useDialog';
import { jsonFetcher } from '@/utils/swr';
import { FiUpload, FiTrash2, FiFileText, FiDownload, FiPlus, FiPieChart, FiCheckCircle } from 'react-icons/fi';

type Report = {
  id: number;
  title: string;
  filename: string | null;
  year: number;
  type: string;
};

type Props = {
  type: 'financial' | 'activity';
  label: string;
};

const inputCls = 'w-full border border-gray-200 rounded-xl text-black px-4 py-2.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50/50 hover:bg-white';
const labelCls = 'block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1';

function ReportAdmin({ type, label }: Props) {
  const { confirm, dialog } = useDialog();
  const { data, mutate } = useSWR<Report[]>(
    `/api/reports?type=${type}`,
    jsonFetcher
  );
  const reports: Report[] = Array.isArray(data) ? data : [];

  const [title, setTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const form = new FormData();
    form.append('title', title);
    form.append('year', String(year));
    form.append('type', type);
    if (file) form.append('file', file);

    const res = await fetch('/api/reports', { method: 'POST', body: form });
    if (res.ok) {
      setTitle('');
      setFile(null);
      setMessage('Амжилттай нэмэгдлээ');
      await mutate();
    } else {
      setMessage('Алдаа гарлаа');
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm('Устгах уу?'))) return;
    await fetch(`/api/reports?id=${id}`, { method: 'DELETE' });
    await mutate();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {dialog}

      {/* Sticky topbar — matches shiidwer style */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
            <FiPieChart size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">{label}</h1>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-1.5">
              Удирдлагын хэсэг
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${message.includes('Алдаа') ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'} text-sm font-bold flex items-center gap-2`}>
            <FiCheckCircle /> {message}
          </div>
        )}

        {/* Add form */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 mb-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h2 className="text-base font-bold text-gray-800 tracking-tight">Шинэ тайлан нэмэх</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Title */}
            <div className="md:col-span-8">
              <label className={labelCls}>Гарчиг</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Тайлангийн гарчиг..."
                className={inputCls}
              />
            </div>

            {/* Year */}
            <div className="md:col-span-4">
              <label className={labelCls}>Жил</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={inputCls}
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* File */}
            <div className="md:col-span-8">
              <label className={labelCls}>Файл (PDF, Word, Excel)</label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 cursor-pointer transition-colors bg-gray-50/50 hover:bg-white">
                <FiUpload size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500 truncate">
                  {file ? file.name : 'Файл сонгох...'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Submit */}
            <div className="md:col-span-4 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-60"
              >
                <FiPlus size={15} />
                {loading ? 'Нэмж байна...' : 'Нэмэх'}
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">
              Нийт {reports.length} тайлан
            </h2>
          </div>

          {reports.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">Тайлан байхгүй байна</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-gray-50/60">
                <div className="col-span-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Гарчиг</div>
                <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Жил</div>
                <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Файл</div>
                <div className="col-span-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Үйлдэл</div>
              </div>
              {reports.map((r) => (
                <div key={r.id} className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FiFileText size={15} className="text-blue-600" />
                    </div>
                    <span className="text-[13px] font-bold text-gray-800 truncate">{r.title}</span>
                  </div>
                  <div className="col-span-2 text-[13px] text-gray-500 font-medium">{r.year}</div>
                  <div className="col-span-2">
                    {r.filename ? (
                      <span className="px-2 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-lg">PDF</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-400 text-[11px] font-bold rounded-lg">—</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {r.filename && (
                      <a
                        href={`/uploads/reports/${encodeURIComponent(r.filename)}`}
                        target="_blank"
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      >
                        <FiDownload size={14} />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(ReportAdmin);
