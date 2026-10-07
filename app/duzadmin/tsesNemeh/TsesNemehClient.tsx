'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import { useRouter, useSearchParams } from 'next/navigation';
import withAuth from '@/components/withAuth';
import CustomPageView from '@/components/CustomPageView';
import MenuPlacementPreview from './MenuPlacementPreview';
import { jsonFetcher } from '@/utils/swr';
import { ALLOWED_ATTR, ALLOWED_TAGS } from '@/utils/htmlAllowlist';
import {
  BUILTIN_MENUS,
  MENU_LIMITS,
  pageHref,
  slugify,
} from '@/utils/menuPages';
import {
  FiArrowLeft,
  FiSave,
  FiInfo,
  FiEye,
  FiEdit3,
  FiExternalLink,
} from 'react-icons/fi';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
});

type PageRecord = {
  id: number;
  title: string;
  slug: string;
  parent: string;
  content: string;
  sortOrder: number;
  published: boolean;
};

type FormState = {
  title: string;
  slug: string;
  parent: string;
  content: string;
  sortOrder: string;
  published: boolean;
};

const EMPTY: FormState = {
  title: '',
  slug: '',
  parent: '',
  content: '',
  sortOrder: '0',
  published: true,
};

const inputCls =
  'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm bg-white hover:border-slate-300 placeholder:text-slate-300';
const labelCls = 'block text-[13px] font-semibold text-slate-700 mb-1.5';
const hintCls = 'text-[12px] text-slate-400 mt-1.5';

const TsesNemeh = () => {
  const router = useRouter();
  const idParam = useSearchParams().get('id');
  const isEdit = !!idParam;

  const { data: loaded, error: loadError } = useSWR<PageRecord>(
    idParam ? `/api/menuPages/${idParam}` : null,
    jsonFetcher,
    { revalidateOnFocus: false }
  );

  const [form, setForm] = useState<FormState>(EMPTY);
  // Until the admin edits the slug by hand it follows the title.
  const [slugTouched, setSlugTouched] = useState(false);
  const [seededId, setSeededId] = useState<number | null>(null);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Seed the form once per loaded record (prev-id pattern, no useEffect).
  if (loaded && loaded.id !== seededId) {
    setSeededId(loaded.id);
    setSlugTouched(true);
    setForm({
      title: loaded.title,
      slug: loaded.slug,
      parent: loaded.parent,
      content: loaded.content,
      sortOrder: String(loaded.sortOrder),
      published: loaded.published,
    });
  }

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onTitle = (title: string) =>
    setForm((f) => ({
      ...f,
      title,
      slug: slugTouched ? f.slug : slugify(title),
    }));

  // Same allow-list the server applies on save, so the preview shows exactly
  // what will be stored and served.
  const previewHtml = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return DOMPurify.sanitize(form.content, { ALLOWED_TAGS, ALLOWED_ATTR });
  }, [form.content]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      title: form.title,
      slug: form.slug,
      parent: form.parent,
      content: form.content,
      sortOrder: form.sortOrder === '' ? 0 : Number(form.sortOrder),
      published: form.published,
    };

    try {
      if (isEdit) await axios.put(`/api/menuPages/${idParam}`, payload);
      else await axios.post('/api/menuPages', payload);
      router.push('/duzadmin/tses');
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const serverMsg = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
      setError(
        status === 401
          ? 'Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.'
          : serverMsg || 'Хадгалахад алдаа гарлаа'
      );
      setSaving(false);
    }
  };

  const waitingForRecord = isEdit && !loaded && !loadError;
  if (waitingForRecord) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-600/20 border-t-brand-600" />
      </div>
    );
  }

  const shownError =
    error || (loadError ? 'Энэ цэсийг олсонгүй эсвэл татаж чадсангүй.' : '');
  const previewTitle = form.title.trim() || 'Цэсний нэр';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Head>
        <title>{isEdit ? 'Цэс засах' : 'Цэс нэмэх'} | Admin</title>
      </Head>

      <form onSubmit={handleSave}>
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
          <div className="max-w-[1500px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/duzadmin/tses"
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Буцах"
              >
                <FiArrowLeft size={20} />
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-slate-900 leading-none truncate">
                  {isEdit ? 'Цэс засах' : 'Шинэ цэс нэмэх'}
                </h1>
                <p className="eyebrow mt-1.5">
                  Баруун талд сайт дээрх харагдацыг шууд харна
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEdit && loaded?.published && (
                <a
                  href={pageHref(loaded.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost hidden sm:inline-flex"
                >
                  <FiExternalLink size={15} />
                  Сайт дээр нээх
                </a>
              )}
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiSave size={16} />
                )}
                Хадгалах
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1500px] mx-auto px-6 mt-6">
          {shownError && (
            <div className="mb-5 bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-xl text-sm font-semibold flex items-center gap-3">
              <FiInfo className="flex-shrink-0" />
              <span>{shownError}</span>
            </div>
          )}

          {/* Below xl the two panels become tabs */}
          <div className="xl:hidden mb-5 inline-flex rounded-xl bg-slate-100 p-1">
            {(
              [
                ['edit', 'Засах', FiEdit3],
                ['preview', 'Урьдчилан харах', FiEye],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                  tab === key
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {/* ── Edit ─────────────────────────────────────────── */}
            <div
              className={`${tab === 'edit' ? 'block' : 'hidden'} xl:block space-y-6 min-w-0`}
            >
              <div className="card p-6 space-y-5">
                <div>
                  <label htmlFor="title" className={labelCls}>
                    Цэсний нэр
                  </label>
                  <input
                    id="title"
                    value={form.title}
                    onChange={(e) => onTitle(e.target.value)}
                    required
                    maxLength={MENU_LIMITS.title}
                    placeholder="Жишээ: Хөгжлийн бодлого"
                    className={inputCls}
                  />
                  <p className={hintCls}>
                    Цэсэнд харагдах нэр бөгөөд хуудасны гарчиг болно.
                  </p>
                </div>

                <div>
                  <label htmlFor="parent" className={labelCls}>
                    Цэсний байршил
                  </label>
                  <select
                    id="parent"
                    value={form.parent}
                    onChange={(e) => update('parent', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Үндсэн цэс (шууд холбоос)</option>
                    {BUILTIN_MENUS.map((m) => (
                      <option key={m.id} value={m.id}>
                        «{m.label}» цэсний дотор
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="slug" className={labelCls}>
                    Хуудасны хаяг (URL)
                  </label>
                  <div className="flex items-stretch">
                    <span className="inline-flex items-center px-3 text-[13px] text-slate-400 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl">
                      /khuudas/
                    </span>
                    <input
                      id="slug"
                      value={form.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        update('slug', e.target.value.toLowerCase());
                      }}
                      required
                      maxLength={MENU_LIMITS.slug}
                      placeholder="hugjliin-bodlogo"
                      className={`${inputCls} rounded-l-none`}
                    />
                  </div>
                  <p className={hintCls}>
                    Нэрээс автоматаар үүснэ. Жижиг латин үсэг, тоо, «-» ашиглана.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="sortOrder" className={labelCls}>
                      Дараалал
                    </label>
                    <input
                      id="sortOrder"
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => update('sortOrder', e.target.value)}
                      min={-MENU_LIMITS.sortOrder}
                      max={MENU_LIMITS.sortOrder}
                      className={inputCls}
                    />
                    <p className={hintCls}>Бага тоотой нь түрүүлж харагдана.</p>
                  </div>

                  <div>
                    <span className={labelCls}>Төлөв</span>
                    <label className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-2.5 cursor-pointer hover:border-slate-300">
                      <input
                        type="checkbox"
                        checked={form.published}
                        onChange={(e) => update('published', e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-brand-600"
                      />
                      <span className="text-[13px] text-slate-700 leading-snug">
                        <span className="font-semibold">Сайтад нийтлэх</span>
                        <br />
                        <span className="text-slate-400">
                          Идэвхгүй бол ноорог хэвээр үлдэнэ.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <label className={labelCls}>Агуулга</label>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-1">
                  <TiptapEditor
                    content={form.content}
                    setContent={(html) => update('content', html)}
                  />
                </div>
              </div>
            </div>

            {/* ── Live preview ─────────────────────────────────── */}
            <div
              className={`${tab === 'preview' ? 'block' : 'hidden'} xl:block xl:sticky xl:top-24 space-y-4 min-w-0`}
            >
              <div>
                <p className="eyebrow mb-2">Цэсэнд харагдах байдал</p>
                <MenuPlacementPreview title={form.title} parent={form.parent} />
              </div>

              <div>
                <p className="eyebrow mb-2">Хуудас сайт дээр иймэрхүү харагдана</p>
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[var(--shadow-card)]">
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                    </div>
                    <div className="flex-1 truncate rounded-md bg-white px-3 py-1 text-[12px] text-slate-500">
                      {pageHref(form.slug || 'huudas')}
                    </div>
                    {!form.published && (
                      <span className="badge bg-amber-50 text-amber-700">Ноорог</span>
                    )}
                  </div>

                  <div className="max-h-[calc(100vh-18rem)] min-h-[360px] overflow-y-auto bg-slate-50">
                    <CustomPageView title={previewTitle} html={previewHtml} preview />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default withAuth(TsesNemeh);
