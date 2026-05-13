'use client';

import React, { useState, useEffect, useCallback } from 'react';
import withAuth from '@/components/withAuth';
import axios from 'axios';
import Head from 'next/head';
import {
  FiEdit,
  FiTrash2,
  FiUpload,
  FiFileText,
  FiFolder,
  FiCalendar,
  FiHash,
  FiChevronLeft,
  FiCheckCircle,
  FiChevronRight,
} from 'react-icons/fi';

const ShiidwerPage = () => {
  const [committee, setCommittee] = useState([]);
  const [committeeText, setCommitteeText] = useState('');
  const [category, setCategory] = useState('УИХ, Байнгын хорооны шийдвэр');
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState('');
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editId, setEditId] = useState<number | null>(null);

  const fetchCommittee = useCallback(async () => {
    try {
      const res = await axios.get(
        `/api/standingCommittee?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      setCommittee(res.data.stcommittee);
      setTotal(res.data.currentCommittee);
    } catch (err) {
      console.log('Fetch Error', err);
    }
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    fetchCommittee();
  }, [fetchCommittee]);

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setSaveLoading(true);

    try {
      const form = new FormData();
      form.append('text', committeeText);
      form.append('category', category);
      form.append('date', date);
      form.append('number', number);
      if (file) form.append('file', file);

      if (editId) {
        await axios.put(`/api/standingCommittee?id=${editId}`, form);
        setMessage('Амжилттай шинэчлэгдлээ ✓');
      } else {
        await axios.post('/api/standingCommittee', form);
        setMessage('Амжилттай хадгалагдлаа ✓');
      }

      setCommitteeText('');
      setCategory('УИХ, Байнгын хорооны шийдвэр');
      setNumber('');
      setDate('');
      setFile(null);
      setEditId(null);
      fetchCommittee();
    } catch (err: any) {
      setMessage('Алдаа гарлаа: ' + err.message);
    } finally {
      setSaveLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Та устгахдаа итгэлтэй байна уу?')) return;
    await axios.delete(`/api/standingCommittee?id=${id}`);
    fetchCommittee();
  };

  const handleEdit = (c: any) => {
    setEditId(c.id);
    setCommitteeText(c.text);
    setCategory(c.category);
    setNumber(c.number);
    setDate(c.Date.split('T')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSort = (field: string) => {
    setSortBy(field);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const inputCls =
    'w-full border border-gray-200 rounded-xl text-black px-4 py-2.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50/50 hover:bg-white';
  const labelCls =
    'block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Head>
        <title>Эрх зүй | Admin</title>
      </Head>

      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <FiFolder size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">
                УИХ, Байнгын хорооны шийдвэр
              </h1>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-1.5">
                Удирдлагын хэсэг
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border ${message.includes('Алдаа') ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'} text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2`}
          >
            <FiCheckCircle /> {message}
          </div>
        )}

        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 mb-10 transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h2 className="text-base font-bold text-gray-800 tracking-tight">
              {editId ? 'Шийдвэр засварлах' : 'Шинэ шийдвэр бүртгэх'}
            </h2>
          </div>

          <form
            onSubmit={submitForm}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            <div className="md:col-span-8">
              <label className={labelCls}>Гарчиг / Тогтоолын нэр</label>
              <textarea
                className={inputCls}
                rows={2}
                value={committeeText}
                onChange={(e) => setCommitteeText(e.target.value)}
                placeholder="Шийдвэрийн утгыг энд бичнэ үү..."
              />
            </div>

            <div className="md:col-span-4">
              <label className={labelCls}>Файл ачааллах (.pdf)</label>
              <div className="relative">
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center gap-2 cursor-pointer ${inputCls} ${file ? 'text-blue-600 font-medium border-blue-200 bg-blue-50/30' : 'text-gray-400'}`}
                >
                  <FiUpload /> {file ? file.name : 'Файл сонгох'}
                </label>
              </div>
            </div>

            <div className="md:col-span-4">
              <label className={labelCls}>Ангилал</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                <option>УИХ, Байнгын хорооны шийдвэр</option>
                <option>Засгийн газрын тогтоол</option>
                <option>ЭМДҮЗ-ийн тогтоол</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className={labelCls}>Огноо</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  className={`${inputCls} pl-10`}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Дугаар</label>
              <div className="relative">
                <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className={`${inputCls} pl-10`}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="№"
                />
              </div>
            </div>

            <div className="md:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={saveLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
              >
                {saveLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiUpload />
                )}
                {editId ? 'Шинэчлэх' : 'Хадгалах'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">
              Бүртгэлтэй шийдвэрүүд ({total})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50/50">
                  <th
                    className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-600"
                    onClick={() => toggleSort('text')}
                  >
                    Гарчиг
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Файл
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Ангилал
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Огноо
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Дугаар
                  </th>
                  <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {committee.map((c: any) => (
                  <tr
                    key={c.id}
                    className="group hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-8 py-4">
                      <div className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 max-w-md">
                        {c.text}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.filename ? (
                        <a
                          href={`/uploads/file/${c.filename}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <FiFileText /> PDF
                        </a>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold border border-gray-100 bg-white text-gray-600 whitespace-nowrap">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-500 font-medium">
                      {new Date(c.Date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-[13px] text-gray-600">
                      {c.number}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 text-blue-500 bg-blue-50/50 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                        >
                          <FiEdit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-red-500 bg-red-50/50 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
            <p className="text-sm text-gray-500 font-medium">
              Нийт {total} бичлэг
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-30"
                disabled={page === 1}
              >
                <FiChevronLeft />
              </button>
              {Array.from({ length: Math.ceil(total / limit) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                    page === i + 1
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                      : 'bg-white border text-gray-600 hover:border-blue-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-30"
                disabled={page >= Math.ceil(total / limit)}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(ShiidwerPage);
