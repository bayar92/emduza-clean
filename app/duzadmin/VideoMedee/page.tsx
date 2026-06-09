'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useDialog } from '@/components/useDialog';
import { jsonFetcher } from '@/utils/swr';
import {
  FiVideo,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiSave,
  FiPlay,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

type VideoItem = {
  id: number;
  title: string;
  videoPath: string;
  createdAt: string;
};

type VideoListResponse = { videos: VideoItem[]; totalVideos: number };

export default function VideoMedee() {
  const router = useRouter();
  const { confirm, dialog } = useDialog();

  const [title, setTitle] = useState('');
  const [video, setVideo] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { data, isLoading: fetchLoading, error: fetchError, mutate } =
    useSWR<VideoListResponse>(
      `/api/video?page=${page}&limit=${limit}`,
      jsonFetcher
    );

  const videoNews = data?.videos ?? [];
  const totalVideos = data?.totalVideos ?? 0;

  // SWR-level fetch failures surface as a sticky banner like any other error.
  const displayedError = error || (fetchError ? 'Видео татаж чадсангүй' : '');

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideo(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!video) {
      setError('Видео файл сонгоно уу.');
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('video', video);

      const res = await axios.post('/api/video', fd);

      if (res.status === 201) {
        setSuccess('Видео амжилттай нэмэгдлээ!');
        setTitle('');
        setVideo(null);

        if (page === 1) await mutate();
        else setPage(1);
      }
    } catch {
      setError('Видео нэмэх үед алдаа гарлаа.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm('Та энэ видеог устгахдаа итгэлтэй байна уу?'))) return;

    try {
      await axios.delete(`/api/video?id=${id}`);
      await mutate();
    } catch {
      setError('Видео устгахад алдаа гарлаа.');
    }
  };

  const inputCls =
    'w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 text-black focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50/50 hover:bg-white';
  const labelCls =
    'block text-[11px] font-bold text-gray-400 uppercase text-black tracking-widest mb-1.5 ml-1';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {dialog}
      <Head>
        <title>Видео мэдээ | Admin</title>
      </Head>

      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-100">
                <FiVideo size={18} />
              </div>
              Видео мэдээ
            </h1>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-1">
              Нийт {totalVideos} видео бүртгэлтэй байна
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold rounded-r-xl animate-in fade-in slide-in-from-top-2">
            {success}
          </div>
        )}
        {displayedError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl animate-in fade-in slide-in-from-top-2">
            {displayedError}
          </div>
        )}

        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 mb-10 transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h2 className="text-base font-bold text-gray-800 tracking-tight">
              Шинэ видео нэмэх
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            <div className="md:col-span-7">
              <label className={labelCls}>Видео гарчиг</label>
              <input
                type="text"
                placeholder="Мэдээний гарчиг энд бичнэ үү..."
                className={inputCls}
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="md:col-span-3">
              <label className={labelCls}>Видео файл (.mp4, .mov)</label>
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  id="video-upload"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <label
                  htmlFor="video-upload"
                  className={`flex items-center gap-2 cursor-pointer ${inputCls} ${video ? 'text-blue-600 font-medium border-blue-200 bg-blue-50/30' : 'text-gray-400'}`}
                >
                  <FiPlus /> {video ? video.name : 'Файл сонгох'}
                </label>
              </div>
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiSave />
                )}
                Хадгалах
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">Бүх видеонууд</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Видео
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Гарчиг
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Огноо
                  </th>
                  <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fetchLoading ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600/20 border-t-blue-600"></div>
                    </td>
                  </tr>
                ) : (
                  videoNews.map((item) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="relative w-40 aspect-video rounded-xl overflow-hidden bg-black shadow-md">
                          <video className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
                            <source
                              src={item.videoPath.replace('public/', '/')}
                            />
                          </video>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white ring-1 ring-white/50">
                              <FiPlay size={16} fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 max-w-md">
                          {item.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                          <FiCalendar className="text-gray-300" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(`/duzadmin/video/edit?id=${item.id}`)
                            }
                            className="p-2 text-blue-500 bg-blue-50/50 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                            title="Засварлах"
                          >
                            <FiEdit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-500 bg-red-50/50 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            title="Устгах"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalVideos > limit && (
            <div className="px-8 py-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
              <p className="text-sm text-gray-500 font-medium">
                Нийт {totalVideos} бичлэг
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-30 transition-all"
                >
                  <FiChevronLeft />
                </button>
                {Array.from({ length: Math.ceil(totalVideos / limit) }).map(
                  (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage(idx + 1)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                        page === idx + 1
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                          : 'bg-white border text-gray-600 hover:border-blue-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(Math.ceil(totalVideos / limit), p + 1)
                    )
                  }
                  disabled={page >= Math.ceil(totalVideos / limit)}
                  className="p-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-30 transition-all"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
