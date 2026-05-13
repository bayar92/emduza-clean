'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import withAuth from '@/components/withAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import TiptapEditor from '@/components/TiptapEditor';
import {
  FiSave,
  FiArrowLeft,
  FiUserPlus,
  FiEdit3,
  FiImage,
  FiInfo,
} from 'react-icons/fi';

const Gishuud = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberParam = searchParams.get('members');

  const [position, setPosition] = useState('Засгийн газрын төлөөлөл');
  const [name, setName] = useState('');
  const [parlament, setParlament] = useState('');
  const [education, setEducation] = useState('');
  const [company, setCompany] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (!memberParam) return;
    try {
      const member = JSON.parse(memberParam);
      setPosition(member.position || '');
      setName(member.name || '');
      setParlament(member.parlament || '');
      setEducation(member.education || '');
      setCompany(member.company || '');
      setImagePreview(member.image || null);
      setEditId(member.id || null);
    } catch (err) {
      console.log('Invalid member data');
    }
  }, [memberParam]);

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    if (imagePreview && imagePreview.startsWith('blob:'))
      URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !parlament) {
      setError('Заавал бөглөх талбаруудыг шалгана уу!');
      return;
    }

    const formData = new FormData();
    formData.append('position', position);
    formData.append('name', name);
    formData.append('parlament', parlament);
    formData.append('education', education);
    formData.append('company', company);
    if (image) formData.append('image', image);

    try {
      if (editId) {
        await axios.put(`/api/members?id=${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`/api/members`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setSuccess(
        `Амжилттай! ${editId ? 'Мэдээлэл шинэчлэгдлээ.' : 'Шинэ гишүүн бүртгэгдлээ.'}`
      );
      setTimeout(() => router.push('/duzadmin/emduzGishuud'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Хүсэлт илгээхэд алдаа гарлаа.');
    }
  };

  const inputCls =
    'w-full border border-gray-200 rounded-xl px-4 py-3 text-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200 text-sm bg-gray-50/30 hover:bg-white placeholder:text-gray-300';
  const labelCls =
    'block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Head>
        <title>{editId ? 'Засах' : 'Нэмэх'} | ЭМДҮЗ Гишүүн</title>
      </Head>

      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/duzadmin/emduzGishuud')}
              className="group flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <div className="p-2 group-hover:bg-blue-50 rounded-full transition-colors text-gray-400 group-hover:text-blue-600">
                <FiArrowLeft size={20} />
              </div>
              <span className="text-sm font-medium">Буцах</span>
            </button>
            <div className="h-6 w-px bg-gray-200 mx-2" />
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {editId ? (
                <FiEdit3 className="text-blue-500" />
              ) : (
                <FiUserPlus className="text-green-500" />
              )}
              {editId ? 'Гишүүний мэдээлэл засах' : 'Шинэ гишүүн бүртгэх'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/duzadmin/emduzGishuud')}
              className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              Цуцлах
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <FiSave size={18} />
              Хадгалах
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        {error && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiInfo />
                <span className="text-sm font-semibold">{error}</span>
              </div>
              <button
                onClick={() => setError('')}
                className="hover:scale-110 transition-transform"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h2 className="text-base font-bold text-gray-800 tracking-tight">
                  Үндсэн мэдээлэл
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6  ">
                <div className="md:col-span-2 text-black">
                  <label className={labelCls}>Төлөөлөл</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Засгийн газрын төлөөлөл">
                      Засгийн газрын төлөөлөл
                    </option>
                    <option value="Даатгуулагчийн төлөөлөл">
                      Даатгуулагчийн төлөөлөл
                    </option>
                    <option value="Ажил олгогчийн төлөөлөл">
                      Ажил олгогчийн төлөөлөл
                    </option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Овог нэр</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Жишээ: Жигжидсүрэнгийн Чинбүрэн"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Парламент / УИХ дахь байдал
                  </label>
                  <input
                    value={parlament}
                    onChange={(e) => setParlament(e.target.value)}
                    placeholder="Жишээ: Монгол Улсын Их Хурлын гишүүн"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                <h2 className="text-base font-bold text-gray-800 tracking-tight">
                  Дэлгэрэнгүй намтар
                </h2>
              </div>

              <div className="space-y-8">
                <div>
                  <label className={labelCls}>Боловсрол</label>
                  <div className="bg-gray-50/30 rounded-2xl border border-gray-100 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500 transition-all p-1">
                    <TiptapEditor
                      content={education}
                      setContent={setEducation}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Байгууллага / Ажлын байр</label>
                  <div className="bg-gray-50/30 rounded-2xl border border-gray-100 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500 transition-all p-1">
                    <TiptapEditor content={company} setContent={setCompany} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-8 sticky top-28">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                <h2 className="text-base font-bold text-gray-800 tracking-tight">
                  Хөрөг зураг
                </h2>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative group w-full aspect-[3/4] mb-8">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-[24px] shadow-2xl border-4 border-white ring-1 ring-gray-100 transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[24px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-3 group-hover:bg-gray-100 transition-colors">
                      <div className="p-4 bg-white rounded-2xl shadow-sm">
                        <FiImage size={32} className="opacity-40" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                        Зураггүй
                      </span>
                    </div>
                  )}

                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-[24px] cursor-pointer backdrop-blur-[2px]">
                    <div className="bg-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform font-bold text-xs text-blue-600 uppercase tracking-wider">
                      <FiImage />
                      Зураг сонгох
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="w-full p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <p className="text-[10px] text-center text-blue-400 font-bold uppercase tracking-widest leading-relaxed">
                    Формат: JPEG, PNG, WebP
                    <br />
                    Хэмжээ: <span className="text-blue-600">10MB хүртэл</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withAuth(Gishuud);
