'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import withAuth from '@/components/withAuth';
import dynamic from 'next/dynamic';
import SuccessModal from '@/components/SuccessModal';
import {
  FiSave,
  FiArrowLeft,
  FiImage,
  FiUser,
  FiMessageSquare,
} from 'react-icons/fi';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
});

const Mendchilgee = () => {
  const [editorContent, setEditorContent] = useState('');
  const [name, setName] = useState('');
  const [image, setImage] = useState<File | string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [existingId, setExistingId] = useState(null);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/mend');
        if (response.data) {
          setName(response.data.name);
          setEditorContent(response.data.company);
          const imgPath = (response.data.image || '').replace(/^public\//, '');
          setImage(imgPath);
          if (imgPath) {
            setImagePreview(imgPath.startsWith('/') ? imgPath : `/${imgPath}`);
          }
          setExistingId(response.data.id);
        }
      } catch (error) {
        setError('Мэдээлэл татахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);

    const formData = new FormData();
    formData.append('company', editorContent);
    formData.append('name', name);

    if (image && typeof image === 'object') {
      formData.append('image', image);
    }

    try {
      setError('');
      let msg = '';
      if (existingId) {
        const response = await axios.put('/api/mend', formData);
        if (response.data?.image) {
          const newPath = response.data.image.replace(/^public\//, '');
          setImage(newPath);
          setImagePreview(newPath.startsWith('/') ? newPath : `/${newPath}`);
        }
        msg = 'Амжилттай засвар орууллаа';
      } else {
        const response = await axios.post('/api/mend', formData);
        setExistingId(response.data.id);
        if (response.data?.image) {
          const newPath = response.data.image.replace(/^public\//, '');
          setImage(newPath);
          setImagePreview(newPath.startsWith('/') ? newPath : `/${newPath}`);
        }
        msg = 'Амжилттай хадгаллаа';
      }

      setModalMessage(msg);
      setModalOpen(true);
    } catch (error: any) {
      const serverMsg = error?.response?.data?.error;
      setError(serverMsg || 'Хадгалахад алдаа гарлаа');
    } finally {
      setSaveLoading(false);
    }
  };

  const inputCls =
    'w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 text-black  focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200 text-sm bg-gray-50/30 hover:bg-white placeholder:text-gray-300';
  const labelCls =
    'block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1';

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
        <title>Даргын мэндчилгээ | Admin</title>
      </Head>

      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
                <FiMessageSquare size={18} />
              </div>
              Даргын мэндчилгээ засах
            </h1>
          </div>

          <button
            onClick={(e: any) => handleSubmit(e)}
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
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl shadow-sm text-sm font-semibold flex items-center gap-2">
            <FiSave /> {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow min-h-[600px] flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h2 className="text-base font-bold text-gray-800 tracking-tight">
                  Мэндчилгээний бичвэр
                </h2>
              </div>

              <div className="flex-1 bg-gray-50/30 rounded-2xl border border-gray-100 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500 transition-all p-1">
                <TiptapEditor
                  content={editorContent}
                  setContent={setEditorContent}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-8 sticky top-28">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                <h2 className="text-base font-bold text-gray-800 tracking-tight">
                  Даргын мэдээлэл
                </h2>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative group w-full aspect-square max-w-[240px] mb-8">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-[24px] shadow-2xl border-4 border-white ring-1 ring-gray-100"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[24px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                      <FiUser size={48} className="opacity-20 mb-2" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Зураггүй
                      </span>
                    </div>
                  )}

                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-[24px] cursor-pointer backdrop-blur-[2px]">
                    <div className="bg-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl text-blue-600 font-bold text-xs uppercase tracking-wider">
                      <FiImage /> Зураг солих
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="w-full space-y-6">
                  <div>
                    <label className={labelCls}>Даргын нэр</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Овог нэр..."
                      className={inputCls}
                    />
                  </div>

                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <p className="text-[10px] text-center text-blue-400 font-bold uppercase tracking-widest leading-relaxed">
                      Зөвлөмж: Цээж зураг эсвэл <br /> албаны зураг сонгоно уу
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <SuccessModal
        open={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default withAuth(Mendchilgee);
