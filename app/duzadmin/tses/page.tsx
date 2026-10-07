'use client';

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import axios from 'axios';
import Head from 'next/head';
import withAuth from '@/components/withAuth';
import { useDialog } from '@/components/useDialog';
import { jsonFetcher } from '@/utils/swr';
import {
  buildAdminSections,
  pageHref,
  type AdminMenuRow,
  type AdminNode,
} from '@/utils/menuPages';
import {
  FiMenu,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiExternalLink,
  FiInfo,
  FiFolder,
  FiFileText,
} from 'react-icons/fi';

const TsesList = () => {
  const { confirm, alert, dialog } = useDialog();
  const { data, isLoading, error, mutate } = useSWR<AdminMenuRow[]>(
    '/api/menuPages?all=1',
    jsonFetcher
  );
  const rows = Array.isArray(data) ? data : [];
  const sections = buildAdminSections(rows);

  const handleDelete = async (row: AdminNode) => {
    const hasKids = row.children.length > 0;
    if (hasKids) {
      await alert(
        `"${row.title}" цэсийн дотор ${row.children.length} дэд цэс байна. Эхлээд тэдгээрийг устгах эсвэл өөр цэс рүү зөөнө үү.`
      );
      return;
    }
    if (!(await confirm(`"${row.title}" цэсийг устгах уу?`))) return;
    try {
      await axios.delete(`/api/menuPages/${row.id}`);
      await mutate();
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
      await alert(msg || 'Устгахад алдаа гарлаа');
    }
  };

  const renderNode = (node: AdminNode, depth: number): React.ReactNode => {
    const isGroup = node.kind === 'group';
    return (
      <React.Fragment key={node.id}>
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 pr-6 hover:bg-slate-50/60 transition-colors"
          style={{ paddingLeft: `${24 + depth * 28}px` }}
        >
          <span
            className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg ${
              isGroup ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600'
            }`}
          >
            {isGroup ? <FiFolder size={15} /> : <FiFileText size={15} />}
          </span>

          <div className="flex-1 min-w-[180px]">
            <p className="text-[14px] font-semibold text-slate-900 truncate">{node.title}</p>
            <p className="text-[12px] text-slate-400 mt-0.5 truncate">
              {isGroup
                ? `Цэс · ${node.children.length} дэд цэс`
                : node.slug
                  ? pageHref(node.slug)
                  : ''}
            </p>
          </div>

          <span className="text-[12px] text-slate-400 tabular-nums w-12">№ {node.sortOrder}</span>

          <span
            className={`badge ${
              node.published ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {node.published ? 'Нийтлэгдсэн' : 'Ноорог'}
          </span>

          <div className="flex items-center gap-1 ml-auto">
            {isGroup && (
              <Link
                href={`/duzadmin/tsesNemeh?parentId=${node.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
              >
                <FiPlus size={13} />
                Дэд цэс нэмэх
              </Link>
            )}
            {!isGroup && node.published && node.slug && (
              <a
                href={pageHref(node.slug)}
                target="_blank"
                rel="noopener noreferrer"
                title="Сайт дээр нээх"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              >
                <FiExternalLink size={15} />
              </a>
            )}
            <Link
              href={`/duzadmin/tsesNemeh?id=${node.id}`}
              title="Засах"
              className="p-2 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors"
            >
              <FiEdit3 size={15} />
            </Link>
            <button
              onClick={() => handleDelete(node)}
              title="Устгах"
              className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        </div>
        {node.children.map((child) => renderNode(child, depth + 1))}
      </React.Fragment>
    );
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
              <h1 className="text-lg font-bold text-slate-900 leading-none">Цэс удирдлага</h1>
              <p className="eyebrow mt-1.5">Нийт {rows.length} цэс</p>
            </div>
          </div>
          <Link href="/duzadmin/tsesNemeh" className="btn-primary">
            <FiPlus size={16} />
            Шинэ цэс нэмэх
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 space-y-6">
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
              Шинэ цэс (dropdown) үүсгээд, түүний дотор дэд цэс эсвэл хуудас нэмж болно.
              Хуудасны агуулгыг бичих үед сайт дээр яг ямар харагдахыг хажууд нь шууд харна.
            </p>
            <Link href="/duzadmin/tsesNemeh" className="btn-primary">
              <FiPlus size={16} />
              Эхний цэсээ нэмэх
            </Link>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.key || 'top'}>
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="eyebrow">{section.label}</p>
                <Link
                  href={
                    section.key
                      ? `/duzadmin/tsesNemeh?parent=${section.key}`
                      : '/duzadmin/tsesNemeh'
                  }
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                >
                  <FiPlus size={13} />
                  Энд нэмэх
                </Link>
              </div>
              <div className="card overflow-hidden divide-y divide-slate-100">
                {section.nodes.map((node) => renderNode(node, 0))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default withAuth(TsesList);
