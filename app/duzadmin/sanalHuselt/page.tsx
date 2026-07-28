'use client';

import { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import Head from 'next/head';
import withAuth from '@/components/withAuth';
import { useDialog } from '@/components/useDialog';
import { jsonFetcher } from '@/utils/swr';
import QuestionEditor, { type Question } from './QuestionEditor';
import {
  FiMessageSquare,
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiMail,
  FiPhone,
  FiChevronDown,
  FiChevronUp,
  FiFolder,
} from 'react-icons/fi';

type Topic = { id: number; title: string; questions: Question[] };
type Answer = { question: string; answer: string };
type Submission = {
  id: number;
  topicTitle: string | null;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  answers: Answer[] | null;
  createdAt: string;
};

function SanalHuselt() {
  const { confirm, dialog } = useDialog();

  const { data: topics, mutate: mutateTopics } = useSWR<Topic[]>(
    '/api/feedbackTopics',
    jsonFetcher
  );
  const { data: submissions, isLoading: submissionsLoading } = useSWR<
    Submission[]
  >('/api/feedback', jsonFetcher);

  const [activeTopicId, setActiveTopicId] = useState<number | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const activeTopic = topics?.find((t) => t.id === activeTopicId) ?? null;
  const topLevelQuestions =
    activeTopic?.questions.filter((q) => q.parentId === null) ?? [];

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    setError('');
    try {
      const created = await axios.post('/api/feedbackTopics', {
        title: newTopicTitle.trim(),
      });
      setNewTopicTitle('');
      await mutateTopics();
      setActiveTopicId(created.data.id);
    } catch {
      setError('Сэдэв нэмэхэд алдаа гарлаа.');
    }
  };

  const handleDeleteTopic = async (id: number) => {
    if (
      !(await confirm(
        'Энэ сэдвийг устгах уу? Дотор нь байгаа бүх асуулт устана.'
      ))
    )
      return;
    try {
      await axios.delete(`/api/feedbackTopics?id=${id}`);
      if (activeTopicId === id) setActiveTopicId(null);
      mutateTopics();
    } catch {
      setError('Сэдэв устгахад алдаа гарлаа.');
    }
  };

  const handleAddQuestion = async () => {
    if (!activeTopicId) return;
    setError('');
    try {
      await axios.post('/api/feedbackQuestions', {
        topicId: activeTopicId,
        type: 'TEXT',
        text: '',
        order: topLevelQuestions.length,
      });
      mutateTopics();
    } catch {
      setError('Асуулт нэмэхэд алдаа гарлаа.');
    }
  };

  const inputCls =
    'w-full border border-gray-200 rounded-xl px-4 py-3 text-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50/50 hover:bg-white';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {dialog}
      <Head>
        <title>Санал хүсэлт | Admin</title>
      </Head>

      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-100">
              <FiMessageSquare size={18} />
            </div>
            Санал хүсэлт
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-10">
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
            {error}
          </div>
        )}

        {/* Topics + questions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
              <h2 className="text-base font-bold text-gray-800">Сэдвүүд</h2>
            </div>

            <form onSubmit={handleAddTopic} className="flex gap-2 mb-4">
              <input
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Шинэ сэдэв..."
                className={inputCls}
              />
              <button
                type="submit"
                className="px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all active:scale-95"
              >
                <FiPlus />
              </button>
            </form>

            <div className="space-y-2">
              {(topics ?? []).map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTopicId(t.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                    activeTopicId === t.id
                      ? 'border-blue-400 bg-blue-50/50'
                      : 'border-gray-100 bg-gray-50/30 hover:bg-gray-100/50'
                  }`}
                >
                  <FiFolder
                    size={14}
                    className={
                      activeTopicId === t.id ? 'text-blue-500' : 'text-gray-400'
                    }
                  />
                  <span className="flex-1 text-sm font-semibold text-gray-700 truncate">
                    {t.title}
                  </span>
                  <span className="text-[11px] text-gray-400 font-bold">
                    {t.questions.filter((q) => q.parentId === null).length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTopic(t.id);
                    }}
                    className="p-1.5 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                    title="Устгах"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
              {topics?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  Сэдэв байхгүй байна.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h2 className="text-base font-bold text-gray-800">
                  {activeTopic
                    ? `"${activeTopic.title}" сэдвийн асуултууд`
                    : 'Асуулт удирдах'}
                </h2>
              </div>
              {activeTopic && (
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  <FiPlus size={15} /> Асуулт нэмэх
                </button>
              )}
            </div>

            {!activeTopic ? (
              <p className="text-sm text-gray-400 text-center py-16">
                Зүүн талаас сэдэв сонгоно уу.
              </p>
            ) : (
              <div className="space-y-4">
                {topLevelQuestions.map((q) => (
                  <QuestionEditor
                    key={q.id}
                    question={q}
                    allQuestions={activeTopic.questions}
                    topicId={activeTopic.id}
                    onChanged={mutateTopics}
                  />
                ))}
                {topLevelQuestions.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Асуулт байхгүй байна.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submissions */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50">
            <h2 className="text-base font-bold text-gray-800">
              Ирсэн хүсэлтүүд ({submissions?.length ?? 0})
            </h2>
          </div>

          {submissionsLoading ? (
            <div className="p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600/20 border-t-blue-600" />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(submissions ?? []).map((s) => {
                const isOpen = expandedId === s.id;
                return (
                  <div key={s.id}>
                    <button
                      onClick={() => setExpandedId(isOpen ? null : s.id)}
                      className="w-full flex items-center justify-between px-8 py-4 hover:bg-gray-50/50 transition-colors text-left"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-800">
                            {s.name}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              s.topicTitle
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-purple-600 bg-purple-50'
                            }`}
                          >
                            {s.topicTitle ?? 'Санал хүсэлт'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-[12px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiMail size={12} /> {s.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiPhone size={12} /> {s.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiCalendar size={12} />
                            {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    {isOpen && (
                      <div className="px-8 pb-6 space-y-3">
                        {s.message ? (
                          <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {s.message}
                            </p>
                          </div>
                        ) : !s.answers || s.answers.length === 0 ? (
                          <p className="text-sm text-gray-400">
                            Хариулт байхгүй.
                          </p>
                        ) : (
                          s.answers.map((a, i) => (
                            <div
                              key={i}
                              className="p-4 bg-gray-50/50 rounded-xl border border-gray-100"
                            >
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                {a.question}
                              </p>
                              <p className="text-sm text-gray-700">
                                {a.answer}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {submissions?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-10">
                  Хүсэлт ирээгүй байна.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(SanalHuselt);
