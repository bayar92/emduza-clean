'use client';
import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Image from 'next/image';
import withAuth from '@/components/withAuth';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import SuccessModal from '@/components/SuccessModal';
import { useDialog } from '@/components/useDialog';
import { jsonFetcher } from '@/utils/swr';
import { FiEdit2, FiTrash2, FiPlus, FiUsers, FiSearch } from 'react-icons/fi';

type Member = {
  id: number;
  name: string;
  position: string;
  education: string;
  company: string;
  parlament: string;
  image: string | null;
  createdAt: string;
};

const EmduzGishuud = () => {
  const { confirm, dialog } = useDialog();
  const { data: rawMembers, isLoading, error, mutate } = useSWR<Member[]>(
    '/api/members',
    jsonFetcher
  );
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();

  const members = useMemo(
    () =>
      [...(rawMembers ?? [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [rawMembers]
  );

  // Show fetch errors via the same modal as action results. The fetch error
  // takes priority only when no action message is queued.
  const modalMsg =
    actionModal ?? (error ? 'Гишүүдийн жагсаалт татаж чадсангүй' : '');
  const modalOpen = modalMsg !== '';

  const loading = isLoading;

  const handleAdd = () => router.push('/duzadmin/gishuud');

  const handleEdit = (id: number) => {
    const selected = members.find((m) => m.id === id);
    if (!selected) return;
    router.push(
      `/duzadmin/gishuud?members=${encodeURIComponent(JSON.stringify(selected))}`
    );
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm('Та энэ гишүүнийг устгахдаа итгэлтэй байна уу?'))) return;
    try {
      await axios.delete(`/api/members?id=${id}`);
      await mutate(
        (current) => (current ?? []).filter((item) => item.id !== id),
        { revalidate: true }
      );
      setActionModal('Амжилттай устгалаа');
    } catch {
      setActionModal('Устгаж чадсангүй');
    }
  };

  const getPositionBadge = (pos: string) => {
    const styles: { [key: string]: string } = {
      'Засгийн газрын төлөөлөл': 'bg-blue-50 text-blue-600 border-blue-100',
      'Даатгуулагчийн төлөөлөл':
        'bg-purple-50 text-purple-600 border-purple-100',
      'Ажил олгогчийн төлөөлөл':
        'bg-orange-50 text-orange-600 border-orange-100',
    };
    return styles[pos] || 'bg-gray-50 text-gray-600 border-gray-100';
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-gray-700">Уншиж байна...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {dialog}
      <Head>
        <title>ЭМДҮЗ-ийн Гишүүд</title>
      </Head>

      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200">
                <FiUsers size={24} />
              </div>
              ЭМДҮЗ — Гишүүдийн жагсаалт
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Нийт <span className="text-blue-600">{members.length}</span>{' '}
              бүртгэлтэй гишүүн байна
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Нэрээр хайх..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all w-full sm:w-64 text-sm"
              />
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95 font-semibold text-sm"
            >
              <FiPlus /> Шинэ гишүүн нэмэх
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Зураг
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Мэдээлэл
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Төлөөлөл
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Намтар товч
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
                    Үйлдэл
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {filteredMembers.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-blue-50/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm border-2 border-white bg-gray-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {item.image ? (
                          <Image
                            src={item.image.startsWith('/') ? item.image : `/${item.image}`}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 font-bold text-xs uppercase">
                            {item.name.split(' ').pop()?.charAt(0)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 italic font-medium">
                        {item.parlament}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border uppercase tracking-tighter ${getPositionBadge(item.position)}`}
                      >
                        {item.position}
                      </span>
                    </td>

                    <td className="px-6 py-4 hidden lg:table-cell max-w-[220px]">
                      <div className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed">
                        {item.education.replace(/<[^>]*>?/gm, '').slice(0, 80)}
                        ...
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="p-2 text-blue-500 bg-blue-50/50 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm border border-transparent hover:border-blue-100"
                          title="Засах"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-500 bg-red-50/50 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm border border-transparent hover:border-red-100"
                          title="Устгах"
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
        </div>

        <SuccessModal
          open={modalOpen}
          message={modalMsg}
          onClose={() => setActionModal(null)}
        />
      </div>
    </div>
  );
};

export default withAuth(EmduzGishuud);
