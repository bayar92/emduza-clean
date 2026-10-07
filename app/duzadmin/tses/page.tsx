'use client';

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import axios from 'axios';
import Head from 'next/head';
import withAuth from '@/components/withAuth';
import { useDialog } from '@/components/useDialog';
import { jsonFetcher } from '@/utils/swr';
import { pageHref, parentLabel } from '@/utils/menuPages';
import {
  FiMenu,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiExternalLink,
  FiInfo,
} from 'react-icons/fi';

type Row = {
  id: number;
  title: string;
  slug: string;
  parent: string;
  sortOrder: number;
  published: boolean;
};

const TsesList = () => {
  const { confirm, alert, dialog } = useDialog();
  const { data, isLoading, error, mutate } = useSWR<Row[]>(
    '/api/menuPages?all=1',
    jsonFetcher
  );
  const rows = Array.isArray(data) ? data : [];

  const handleDelete = async (row: Row) => {
    if (!(await confirm(`"${row.title}" цэсийг агуулгын хамт устгах уу?`))) return;
    try {
      await axios.delete(`/api/menuPages/${row.id}`);
      await mutate();
    } catch {
      await alert('Устгахад алдаа гарлаа');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {dialog}
      <Head>
        <title>Цэс удирдлага | Admin</title>
      </Head>

      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-600 rounded-xl text-white">
              <FiMenu size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                Цэс удирдлага
              </h1>
              <p className="eyebrow mt-1.5">Нийт {rows.length} цэс</p>
            </div>
          </div>
          <Link href="/duzadmin/tsesNemeh" className="btn-primary">
            <FiPlus size={16} />
            Шинэ цэс нэмэх
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 space-y-4">
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-xl text-sm font-semibold flex items-center gap-3">
            <FiInfo className="flex-shrink-0" />
            Мэдээлэл татахад алдаа гарлаа
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-600/20 border-t-brand-600" />
          </div>
        ) : rows.length === 0 && !error ? (
          <div className="card text-center py-16 px-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center">
              <FiMenu className="text-brand-600" size={24} />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Одоогоор нэмсэн цэс байхгүй байна
            </h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
              Цэс нэмээд дотор нь мэдээллээ бичнэ. Хадгалахаасаа өмнө сайт дээр
              яг ямар харагдахыг хажууд нь шууд харж болно.
            </p>
            <Link href="/duzadmin/tsesNemeh" className="btn-primary">
              <FiPlus size={16} />
              Эхний цэсээ нэмэх
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden divide-y divide-slate-100">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex-1 min-w-[220px]">
                  <p className="text-[14px] font-semibold text-slate-900 truncate">
                    {row.title}
                  </p>
                  <p className="text-[12px] text-slate-400 mt-0.5 truncate">
                    {pageHref(row.slug)}
                  </p>
                </div>

                <span className="text-[12px] text-slate-600 bg-slate-100 rounded-full px-3 py-1 font-medium">
                  {parentLabel(row.parent)}
                </span>

                <span className="text-[12px] text-slate-400 tabular-nums w-16">
                  № {row.sortOrder}
                </span>

                <span
                  className={`badge ${
                    row.published
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {row.published ? 'Нийтлэгдсэн' : 'Ноорог'}
                </span>

                <div className="flex items-center gap-1.5 ml-auto">
                  {row.published && (
                    <a
                      href={pageHref(row.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Сайт дээр нээх"
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      <FiExternalLink size={15} />
                    </a>
                  )}
                  <Link
                    href={`/duzadmin/tsesNemeh?id=${row.id}`}
                    title="Засах"
                    className="p-2 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <FiEdit3 size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(row)}
                    title="Устгах"
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(TsesList);
