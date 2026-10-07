'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Head from 'next/head';
import withAuth from '@/components/withAuth';
import SuccessModal from '@/components/SuccessModal';
import { jsonFetcher } from '@/utils/swr';
import {
  CONTACT_LIMITS,
  DEFAULT_CONTACT,
  type ContactInfoData,
} from '@/utils/contact';
import {
  FiSave,
  FiPhone,
  FiMapPin,
  FiMail,
  FiShare2,
  FiInfo,
} from 'react-icons/fi';

const inputCls =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm bg-white hover:border-slate-300 placeholder:text-slate-300';
const labelCls = 'flex items-center gap-2 text-[13px] font-semibold text-slate-700 mb-2';
const hintCls = 'text-[12px] text-slate-400 mt-1.5 ml-0.5';

const HolbooBarih = () => {
  const { data, isLoading, error: fetchError, mutate } =
    useSWR<ContactInfoData>('/api/contact', jsonFetcher, {
      revalidateOnFocus: false,
    });

  // Seed the form once from the saved values (the API always returns something:
  // saved data, or the built-in defaults before the first save).
  const [form, setForm] = useState<ContactInfoData>(DEFAULT_CONTACT);
  const [seeded, setSeeded] = useState(false);
  if (data && !seeded) {
    setSeeded(true);
    setForm(data);
  }

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const set =
    (key: keyof ContactInfoData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await axios.put<ContactInfoData>('/api/contact', form);
      setForm(res.data);
      await mutate(res.data, { revalidate: false });
      setModalOpen(true);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const serverMsg = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
      setError(
        status === 401
          ? 'Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.'
          : serverMsg || 'Хадгалахад алдаа гарлаа'
      );
    } finally {
      setSaving(false);
    }
  };

  const displayedError =
    error || (fetchError ? 'Мэдээлэл татахад алдаа гарлаа' : '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-600/20 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Head>
        <title>Холбоо барих | Admin</title>
      </Head>

      <form onSubmit={handleSubmit}>
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-600 rounded-xl text-white">
                <FiPhone size={18} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-none">
                  Холбоо барих мэдээлэл
                </h1>
                <p className="eyebrow mt-1.5">Сайтын доод хэсэгт харагдана</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSave size={16} />
              )}
              Хадгалах
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 mt-8 space-y-6">
          {displayedError && (
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 p-4 rounded-r-xl text-sm font-semibold flex items-center gap-3">
              <FiInfo className="flex-shrink-0" />
              <span>{displayedError}</span>
            </div>
          )}

          <div className="card p-6 md:p-8 space-y-6">
            <div>
              <label htmlFor="address" className={labelCls}>
                <FiMapPin className="text-brand-600" /> Хаяг
              </label>
              <textarea
                id="address"
                value={form.address}
                onChange={set('address')}
                rows={3}
                required
                maxLength={CONTACT_LIMITS.address}
                placeholder="Дүүрэг, хороо, байр, тоот..."
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className={labelCls}>
                  <FiPhone className="text-brand-600" /> Холбоо барих утас
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  required
                  maxLength={CONTACT_LIMITS.phone}
                  placeholder="77135051"
                  className={inputCls}
                />
                <p className={hintCls}>
                  Хэд хэдэн дугаарыг таслалаар тусгаарлаж болно. Эхний дугаар
                  нь дарахад залгадаг холбоос болно.
                </p>
              </div>

              <div>
                <label htmlFor="email" className={labelCls}>
                  <FiMail className="text-brand-600" /> Цахим шуудангийн хаяг
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  required
                  maxLength={CONTACT_LIMITS.email}
                  placeholder="info@example.gov.mn"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className="card p-6 md:p-8 space-y-6">
            <div>
              <p className="eyebrow mb-1">Нийгмийн сүлжээ</p>
              <p className="text-[13px] text-slate-500">
                Хоёр талбарыг хоосон орхивол footer-т харагдахгүй.
              </p>
            </div>

            <div>
              <label htmlFor="socialName" className={labelCls}>
                <FiShare2 className="text-brand-600" /> Хаягийн нэр
              </label>
              <input
                id="socialName"
                value={form.socialName}
                onChange={set('socialName')}
                maxLength={CONTACT_LIMITS.socialName}
                placeholder="Эрүүл мэндийн даатгалын үндэсний зөвлөл"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="socialUrl" className={labelCls}>
                <FiShare2 className="text-brand-600" /> Холбоос (заавал биш)
              </label>
              <input
                id="socialUrl"
                type="url"
                value={form.socialUrl}
                onChange={set('socialUrl')}
                maxLength={CONTACT_LIMITS.socialUrl}
                placeholder="https://www.facebook.com/..."
                className={inputCls}
              />
              <p className={hintCls}>
                Оруулбал нэр нь холбоос болж, footer-ийн Facebook товч энэ хаяг
                руу очно. <code>https://</code> гэж эхлэх ёстой.
              </p>
            </div>
          </div>
        </div>
      </form>

      <SuccessModal
        open={modalOpen}
        message="Холбоо барих мэдээлэл хадгалагдлаа. Сайтад шууд шинэчлэгдсэн."
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default withAuth(HolbooBarih);
