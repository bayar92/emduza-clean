'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import withAuth from '@/components/withAuth';
import dynamic from 'next/dynamic';
import { FiSave, FiInfo, FiCheckCircle, FiFileText } from 'react-icons/fi';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
});

const EmduzTaniltsuulga = () => {
  const [editorContent, setEditorContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios
      .get('/api/introduction')
      .then((res) => {
        if (res.data) {
          setEditorContent(res.data.content);
          setExistingId(res.data.id);
        }
      })
      .catch(() => setError('Мэдээлэл татахад алдаа гарлаа'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setSuccess('');

    const payload = { content: editorContent };

    try {
      if (existingId) {
        await axios.put('/api/introduction', payload);
        setSuccess('Амжилттай засвар орууллаа');
      } else {
        const res = await axios.post('/api/introduction', payload);
        setExistingId(res.data.id);
        setSuccess('Амжилттай хадгаллаа');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Хадгалахад алдаа гарлаа');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
            Уншиж байна...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      <Head>
        <title>ЭМДҮЗ танилцуулга | Admin</title>
      </Head>

      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <FiFileText size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">
                ЭМДҮЗ-ийн танилцуулга
              </h1>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-1">
                Байгууллагын үндсэн мэдээлэл засах
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saveLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            {saveLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <FiSave size={18} />
            )}
            {saveLoading
              ? 'Түр хүлээнэ үү...'
              : existingId
                ? 'Засварыг хадгалах'
                : 'Хадгалах'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        {error && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl shadow-sm flex items-center gap-3">
              <FiInfo className="flex-shrink-0" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
          </div>
        )}
        <p className="mb-6 text-center text-gray-400 text-xs font-medium uppercase tracking-widest">
          Сүүлчийн өөрчлөлт: {new Date().toLocaleDateString()}
        </p>
        {success && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2">
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-xl shadow-sm flex items-center gap-3">
              <FiCheckCircle className="flex-shrink-0" />
              <span className="text-sm font-semibold">{success}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col transition-shadow hover:shadow-md">
          <div className="p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
              <h2 className="text-base font-bold text-gray-800 tracking-tight">
                Нийтлэл засах талбар
              </h2>
            </div>

            <div className="flex-1 bg-gray-50/30 rounded-2xl border border-gray-100 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500 transition-all p-1 flex flex-col">
              <TiptapEditor
                content={editorContent}
                setContent={setEditorContent}
                contentClassName="flex-1 overflow-y-auto min-h-[500px] [&_.ProseMirror]:h-full [&_.ProseMirror]:text-gray-800 [&_.ProseMirror]:outline-none [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:p-6 [&_.ProseMirror]:text-[15px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(EmduzTaniltsuulga);
