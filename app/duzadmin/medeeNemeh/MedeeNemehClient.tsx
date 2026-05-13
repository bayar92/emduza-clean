'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TiptapEditor from '@/components/TiptapEditor';
import Head from 'next/head';
import {
  FiSave,
  FiArrowLeft,
  FiImage,
  FiPlus,
  FiX,
  FiCalendar,
  FiTag,
  FiFileText,
  FiUpload,
} from 'react-icons/fi';

export default function MedeeNemehClient() {
  const router = useRouter();
  const params = useSearchParams();
  const slug = params.get('slug');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Мэдээлэл');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [newImages, setNewImages] = useState<File[]>([]);
  const [oldImages, setOldImages] = useState<string[]>([]);
  const [deleteImages, setDeleteImages] = useState<string[]>([]);

  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchItem() {
      const res = await fetch(`/api/news?slug=${slug}`);
      const data = await res.json();

      setEditId(data.id);
      setTitle(data.title);
      setCategory(data.category);
      setContent(data.content);
      setDate(data.date ? data.date.split('T')[0] : '');
      setCoverPreview(data.coverImage);
      setOldImages(data.images || []);
    }

    fetchItem();
  }, [slug]);

  const handleCoverChange = (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverImage(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleImagesChange = (e: any) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...(files as File[])]);
  };

  const removeOldImage = (img: string) => {
    setDeleteImages((p) => [...p, img]);
    setOldImages((p) => p.filter((i) => i !== img));
  };

  const removeNewImage = (index: number) => {
    setNewImages((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaveLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('content', content);
    formData.append('date', date);

    if (coverImage) formData.append('coverImage', coverImage);
    newImages.forEach((img) => formData.append('images', img));
    deleteImages.forEach((img) => formData.append('deleteImages', img));

    if (editId) formData.append('id', editId.toString());

    try {
      const res = await fetch('/api/news', {
        method: editId ? 'PUT' : 'POST',
        body: formData,
      });

      if (res.ok) {
        router.push('/duzadmin/medee');
      }
    } catch (err) {
      alert('Алдаа гарлаа');
    } finally {
      setSaveLoading(false);
    }
  };

  const inputCls =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-4 text-black focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50/50 hover:bg-white';
  const labelCls =
    'block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Head>
        <title>{editId ? 'Мэдээ засах' : 'Мэдээ нэмэх'} | Admin</title>
      </Head>

      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/duzadmin/medee')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">
                {editId ? 'Мэдээ засах' : 'Мэдээ нэмэх'}
              </h1>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-1">
                Мэдээллийн агуулга болон зураг
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/duzadmin/medee')}
              className="text-sm font-medium text-gray-400 hover:text-gray-600 px-4"
            >
              Цуцлах
            </button>
            <button
              onClick={handleSubmit}
              disabled={saveLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              {saveLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSave size={18} />
              )}
              Хадгалах
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h2 className="text-base font-bold text-gray-800 tracking-tight">
                  Үндсэн мэдээлэл
                </h2>
              </div>

              <div>
                <label className={labelCls}>Мэдээний гарчиг</label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Гарчиг энд бичнэ үү..."
                  className={`${inputCls} text-base font-medium`}
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Ангилал сонгох</label>
                  <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`${inputCls} pl-10`}
                    >
                      <option value="Мэдээлэл">Мэдээлэл</option>
                      <option value="Онцлох мэдээ">Онцлох мэдээ</option>
                      <option value="ЭМДҮЗ-ийн хуралдаан">
                        ЭМДҮЗ-ийн хуралдаан
                      </option>
                      <option value="Техникийн хорооны мэдээлэл">
                        Техникийн хорооны мэдээлэл
                      </option>
                      <option value="Хяналт үнэлгээ">Хяналт үнэлгээ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Нийтлэх огноо</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                <h2 className="text-base font-bold text-gray-800 tracking-tight">
                  Дэлгэрэнгүй агуулга
                </h2>
              </div>
              <div className="bg-gray-50/30 rounded-2xl border border-gray-100 p-1">
                <TiptapEditor content={content} setContent={setContent} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                <h2 className="text-base font-bold text-gray-800 tracking-tight">
                  Нүүр зураг
                </h2>
              </div>

              <div className="relative group w-full aspect-video mb-4">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white ring-1 ring-gray-100"
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <FiImage size={32} className="opacity-20 mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Зураггүй
                    </span>
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-2xl cursor-pointer backdrop-blur-[2px]">
                  <div className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-blue-600 flex items-center gap-2">
                    <FiUpload /> Солих
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={labelCls}>Зургийн цомог</h3>
                  <label className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                    <FiPlus /> Нэмэх
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {oldImages.map((img) => (
                    <div key={img} className="relative aspect-square group">
                      <img
                        src={img}
                        className="w-full h-full object-cover rounded-lg border border-gray-100"
                        alt="gallery"
                      />
                      <button
                        type="button"
                        onClick={() => removeOldImage(img)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}

                  {newImages.map((file, idx) => (
                    <div key={idx} className="relative aspect-square group">
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover rounded-lg border border-blue-200"
                        alt="new"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl">
                <div className="flex gap-3 text-blue-600">
                  <FiFileText className="shrink-0 mt-0.5" />
                  <p className="text-[10px] font-medium leading-relaxed uppercase tracking-wider">
                    Нүүр зураг нь мэдээний жагсаалтад харагдана. <br />
                    <span className="font-bold">Хэмжээ: 1200x800px</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
