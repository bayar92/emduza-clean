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
  MAX_MENU_DEPTH,
  MENU_LIMITS,
  ancestorInfo,
  buildPlacementOptions,
  decodePlacement,
  encodePlacement,
  isBuiltinParent,
  pageHref,
  slugify,
  type AdminMenuRow,
  type MenuKind,
} from '@/utils/menuPages';
import {
  FiArrowLeft,
  FiSave,
  FiInfo,
  FiEye,
  FiEdit3,
  FiExternalLink,
  FiFileText,
  FiFolder,
} from 'react-icons/fi';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
});

type PageRecord = {
  id: number;
  title: string;
  kind: MenuKind;
  slug: string | null;
  parent: string;
  parentId: number | null;
  content: string;
  sortOrder: number;
  published: boolean;
};

type FormState = {
  kind: MenuKind;
  title: string;
  slug: string;
  /** Placement <select> value: "" | "b:<builtin>" | "c:<groupId>". */
  placement: string;
  content: string;
  sortOrder: string;
  published: boolean;
};

const inputCls =
  'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm bg-white hover:border-slate-300 placeholder:text-slate-300';
const labelCls = 'block text-[13px] font-semibold text-slate-700 mb-1.5';
const hintCls = 'text-[12px] text-slate-400 mt-1.5';

const KIND_CARDS = [
  {
    kind: 'page' as const,
    icon: FiFileText,
    title: 'Хуудас',
    desc: 'Өөрийн агуулга, хаягтай. Дарахад хуудас нээгдэнэ.',
  },
  {
    kind: 'group' as const,
    icon: FiFolder,
    title: 'Цэс (дэд цэстэй)',
    desc: 'Dropdown. Дотор нь дэд цэс эсвэл хуудас нэмнэ.',
  },
];

const TsesNemehForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const idParam = params.get('id');
  const isEdit = !!idParam;

  const { data: loaded, error: loadError } = useSWR<PageRecord>(
    idParam ? `/api/menuPages/${idParam}` : null,
    jsonFetcher,
    { revalidateOnFocus: false }
  );
  const { data: allData } = useSWR<AdminMenuRow[]>('/api/menuPages?all=1', jsonFetcher, {
    revalidateOnFocus: false,
  });
  const allRows = useMemo(() => (Array.isArray(allData) ? allData : []), [allData]);

  // "Дэд цэс нэмэх" links arrive as ?parentId=<group>, "Энд нэмэх" as ?parent=<builtin>.
  const [form, setForm] = useState<FormState>(() => {
    const presetParentId = params.get('parentId');
    const presetParent = params.get('parent');
    return {
      kind: params.get('kind') === 'group' ? 'group' : 'page',
      title: '',
      slug: '',
      placement:
        presetParentId && /^\d+$/.test(presetParentId)
          ? `c:${presetParentId}`
          : presetParent && isBuiltinParent(presetParent)
            ? `b:${presetParent}`
            : '',
      content: '',
      sortOrder: '0',
      published: true,
    };
  });
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
      kind: loaded.kind,
      title: loaded.title,
      slug: loaded.slug ?? '',
      placement: encodePlacement(loaded.parent, loaded.parentId),
      content: loaded.content,
      sortOrder: String(loaded.sortOrder),
      published: loaded.published,
    });
  }

  const isGroup = form.kind === 'group';
  const { parent, parentId } = decodePlacement(form.placement);

  const options = useMemo(
    () => buildPlacementOptions(allRows, { kind: form.kind, excludeId: loaded?.id }),
    [allRows, form.kind, loaded?.id]
  );
  const { chain, rootBuiltin } = useMemo(
    () => ancestorInfo(allRows, parentId),
    [allRows, parentId]
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onTitle = (title: string) =>
    setForm((f) => ({
      ...f,
      title,
      slug: slugTouched || f.kind === 'group' ? f.slug : slugify(title),
    }));

  const onKind = (kind: MenuKind) => {
    if (isEdit || kind === form.kind) return;
    // A group has less room below it, so the chosen placement may not fit.
    const stillValid = buildPlacementOptions(allRows, { kind }).some(
      (o) => o.value === form.placement
    );
    setForm((f) => ({
      ...f,
      kind,
      placement: stillValid ? f.placement : '',
      slug: kind === 'page' && !slugTouched ? slugify(f.title) : f.slug,
    }));
  };

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
      kind: form.kind,
      title: form.title,
      slug: isGroup ? undefined : form.slug,
      parent,
      parentId,
      content: isGroup ? '' : form.content,
      sortOrder: form.sortOrder === '' ? 0 : Number(form.sortOrder),
      published: form.published,
    };

    try {
      if (isEdit) {
        await axios.put(`/api/menuPages/${idParam}`, payload);
        router.push('/duzadmin/tses');
      } else {
        const res = await axios.post<{ id: number }>('/api/menuPages', payload);
        // An empty dropdown shows nothing on the site, so go straight on to
        // adding its first sub-menu.
        router.push(
          isGroup ? `/duzadmin/tsesNemeh?parentId=${res.data.id}` : '/duzadmin/tses'
        );
      }
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
  const pageTitle = isEdit
    ? isGroup ? 'Цэс засах' : 'Хуудас засах'
    : parentId !== null || parent ? 'Дэд цэс нэмэх' : 'Шинэ цэс нэмэх';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Head>
        <title>{pageTitle} | Admin</title>
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
                  {pageTitle}
                </h1>
                <p className="eyebrow mt-1.5">
                  Баруун талд сайт дээрх харагдацыг шууд харна
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEdit && !isGroup && loaded?.published && loaded.slug && (
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
                  <span className={labelCls}>Төрөл</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {KIND_CARDS.map(({ kind, icon: Icon, title, desc }) => {
                      const selected = form.kind === kind;
                      return (
                        <button
                          key={kind}
                          type="button"
                          disabled={isEdit && !selected}
                          onClick={() => onKind(kind)}
                          className={`text-left flex items-start gap-3 rounded-xl border px-4 py-3 transition-all ${
                            selected
                              ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          } ${isEdit && !selected ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`mt-0.5 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg ${
                              selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Icon size={15} />
                          </span>
                          <span>
                            <span className="block text-[13px] font-semibold text-slate-900">
                              {title}
                            </span>
                            <span className="block text-[12px] text-slate-500 leading-snug mt-0.5">
                              {desc}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {isEdit && (
                    <p className={hintCls}>Үүссэн цэсийн төрлийг өөрчлөх боломжгүй.</p>
                  )}
                </div>

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
                    {isGroup
                      ? 'Цэсний мөрөнд харагдах нэр.'
                      : 'Цэсэнд харагдах нэр бөгөөд хуудасны гарчиг болно.'}
                  </p>
                </div>

                <div>
                  <label htmlFor="placement" className={labelCls}>
                    Цэсний байршил
                  </label>
                  <select
                    id="placement"
                    value={form.placement}
                    onChange={(e) => update('placement', e.target.value)}
                    className={inputCls}
                  >
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                    {!options.some((o) => o.value === form.placement) && (
                      <option value={form.placement}>Сонгосон байршил</option>
                    )}
                  </select>
                  <p className={hintCls}>
                    Цэс хамгийн ихдээ {MAX_MENU_DEPTH} түвшинтэй. Бэлэн цэсний
                    зүйл (жишээ нь «Бидний тухай › Ажлын алба») дотор ч нэмж болно.
                  </p>
                </div>

                {!isGroup && (
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
                )}

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
                          {isGroup
                            ? 'Идэвхгүй бол дотор нь байгаа бүх цэс нуугдана.'
                            : 'Идэвхгүй бол ноорог хэвээр үлдэнэ.'}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {isGroup ? (
                <div className="card p-6 flex items-start gap-3 bg-amber-50/50 border-amber-100">
                  <FiInfo className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    Энэ цэс өөрөө хуудас биш, зөвхөн dropdown юм. Хадгалсны дараа
                    дотор нь эхний дэд цэсийг нэмэх хуудас автоматаар нээгдэнэ.
                    Дотор нь нэг ч цэс байхгүй бол сайтад харагдахгүй.
                  </p>
                </div>
              ) : (
                <div className="card p-6">
                  <label className={labelCls}>Агуулга</label>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-1">
                    <TiptapEditor
                      content={form.content}
                      setContent={(html) => update('content', html)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Live preview ─────────────────────────────────── */}
            <div
              className={`${tab === 'preview' ? 'block' : 'hidden'} xl:block xl:sticky xl:top-24 space-y-4 min-w-0`}
            >
              <div>
                <p className="eyebrow mb-2">Цэсэнд харагдах байдал</p>
                <MenuPlacementPreview
                  title={form.title}
                  kind={form.kind}
                  parent={parent}
                  chain={chain}
                  rootBuiltin={rootBuiltin}
                />
              </div>

              {!isGroup && (
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

                    <div className="max-h-[calc(100vh-22rem)] min-h-[320px] overflow-y-auto bg-slate-50">
                      <CustomPageView title={previewTitle} html={previewHtml} preview />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// Remount the form whenever the query changes. After creating a menu we land on
// ?parentId=<id> to add its first sub-menu; without a fresh mount React would
// keep the previous entry's state and ignore the preset placement.
const TsesNemeh = () => {
  const params = useSearchParams();
  return <TsesNemehForm key={params.toString()} />;
};

export default withAuth(TsesNemeh);
