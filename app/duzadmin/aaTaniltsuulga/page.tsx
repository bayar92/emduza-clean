'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Head from 'next/head';
import withAuth from '@/components/withAuth';
import dynamic from 'next/dynamic';
import SuccessModal from '@/components/SuccessModal';
import { jsonFetcher } from '@/utils/swr';
import { FiSave, FiFileText, FiInfo } from 'react-icons/fi';

type IntroPayload = { id: number; content: string } | null;

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
});

const AaTaniltsuulga = () => {
  const { data, isLoading: loading, error: fetchError, mutate } =
    useSWR<IntroPayload>('/api/aaIntroduction', jsonFetcher, {
      revalidateOnFocus: false,
    });

  // Editor state is locally mutable, so seed it from the fetched record once
  // per record-id change. This avoids useEffect for the "props → state" sync.
  const [editorContent, setEditorContent] = useState('');
  const [seededId, setSeededId] = useState<number | null>(null);
  const dataId = data?.id ?? null;
  if (dataId !== seededId) {
    setSeededId(dataId);
    setEditorContent(data?.content ?? '');
  }

  const existingId = dataId;
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const displayedError =
    error || (fetchError ? 'Мэдээлэл татахад алдаа гарлаа' : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');

    try {
      let message = '';
      if (existingId) {
        await axios.put('/api/aaIntroduction', { content: editorContent });
        message = 'Амжилттай засвар орууллаа';
      } else {
        await axios.post('/api/aaIntroduction', { content: editorContent });
        message = 'Амжилттай хадгаллаа';
      }

      await mutate();
      setSuccess(message);
      setModalOpen(true);
    } catch {
      setError('Хадгалахад алдаа гарлаа');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600/20 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Head>
        <title>Ажлын албаны танилцуулга | Admin</title>
      </Head>

      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <FiFileText size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">
                Ажлын албаны танилцуулга
              </h1>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-1.5">
                Мэдээллийн агуулгыг засах
              </p>
            </div>
          </div>

          <button
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
            disabled={saveLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            {saveLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <FiSave size={18} />
            )}
            {existingId ? 'Засварыг хадгалах' : 'Хадгалах'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        {displayedError && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl shadow-sm flex items-center gap-3">
              <FiInfo className="flex-shrink-0" />
              <span className="text-sm font-semibold">{displayedError}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-8 min-h-[650px] flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h2 className="text-base font-bold text-gray-800 tracking-tight">
              Нийтлэл засах
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 bg-gray-50/30 rounded-2xl border border-gray-100 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500 transition-all p-1 flex flex-col">
              <TiptapEditor
                content={editorContent}
                setContent={setEditorContent}
                contentClassName="flex-1 overflow-y-auto min-h-[500px] [&_.ProseMirror]:h-full [&_.ProseMirror]:text-gray-800 [&_.ProseMirror]:outline-none [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:p-6 [&_.ProseMirror]:text-[15px]"
              />
            </div>

            <div className="mt-8 flex justify-end items-center gap-4 border-t pt-6">
              <span className="text-xs text-gray-400 italic">
                Сүүлд хадгалсан: {new Date().toLocaleDateString()}
              </span>
            </div>
          </form>
        </div>
      </div>

      <SuccessModal
        open={modalOpen}
        message={success}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default withAuth(AaTaniltsuulga);
