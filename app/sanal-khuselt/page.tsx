'use client';

import { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { jsonFetcher } from '@/utils/swr';
import TopNavBar from '@/components/TopNavBar';
import FooterNavBar from '@/components/FooterNavBar';
import QuestionField from './QuestionField';
import {
  FiSend,
  FiCheckCircle,
  FiMessageSquare,
  FiClipboard,
  FiArrowLeft,
} from 'react-icons/fi';

type QuestionType = 'TEXT' | 'YES_NO' | 'MULTIPLE_CHOICE' | 'MULTIPLE_CHOICE_FOLLOWUP';
type Question = {
  id: number;
  parentId: number | null;
  triggerValue: string | null;
  type: QuestionType;
  text: string;
  options: string[] | null;
};
type Topic = { id: number; title: string; questions: Question[] };
type Mode = 'simple' | 'survey';

const inputCls =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm bg-white placeholder:text-slate-300';
const labelCls = 'block text-[13px] font-semibold text-slate-700 mb-2';

export default function SanalKhuseltPage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <Shell>
        <div className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <FiCheckCircle className="mx-auto text-brand-600 mb-4" size={48} />
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Баярлалаа!
            </h1>
            <p className="text-slate-500 text-sm">
              Таны санал хүсэлт амжилттай хүлээн авагдлаа.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  if (!mode) {
    return (
      <Shell>
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-brand-600 p-2.5 rounded-xl text-white">
              <FiMessageSquare size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Санал хүсэлт</h1>
          </div>
          <p className="text-slate-500 text-sm mb-10">
            Танай санал хүсэлт бидэнд чухал. Доорхоос сонгоно уу.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ModeCard
              icon={<FiMessageSquare size={22} />}
              title="Санал хүсэлт"
              description="Ямар нэгэн зүйлийн талаар чөлөөтэй санал хүсэлтээ бичиж илгээнэ."
              onClick={() => setMode('simple')}
            />
            <ModeCard
              icon={<FiClipboard size={22} />}
              title="Судалгаа"
              description="Тодорхой сэдвийн дагуу бэлтгэсэн асуултуудад хариулна."
              onClick={() => setMode('survey')}
            />
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-2xl mx-auto px-6 py-16 min-h-[60vh]">
        <button
          type="button"
          onClick={() => setMode(null)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 mb-6 transition-colors"
        >
          <FiArrowLeft size={15} /> Буцах
        </button>

        {mode === 'simple' ? (
          <SimpleForm onDone={() => setDone(true)} />
        ) : (
          <SurveyForm onDone={() => setDone(true)} />
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNavBar />
      {children}
      <FooterNavBar />
    </>
  );
}

function ModeCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left p-6 rounded-2xl border border-slate-200 bg-white hover:border-brand-400 hover:shadow-lg transition-all group"
    >
      <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h2 className="font-bold text-slate-900 mb-1.5">{title}</h2>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </button>
  );
}

function SimpleForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await axios.post('/api/feedback', { name, email, phone, message });
      onDone();
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : null;
      setError(msg || 'Хүсэлт илгээхэд алдаа гарлаа.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Санал хүсэлт илгээх</h1>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-semibold rounded-r-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className={labelCls}>Нэр</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
            className={inputCls}
            placeholder="Таны нэр"
          />
        </div>
        <div>
          <label className={labelCls}>Утасны дугаар</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            maxLength={30}
            className={inputCls}
            placeholder="99001122"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Имэйл хаяг</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputCls}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className={labelCls}>Санал хүсэлт</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          className={inputCls}
          placeholder="Санал хүсэлтээ энд бичнэ үү..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-100 transition-all active:scale-95"
      >
        <FiSend size={16} />
        Илгээх
      </button>
    </form>
  );
}

function SurveyForm({ onDone }: { onDone: () => void }) {
  const { data: topics } = useSWR<Topic[]>('/api/feedbackTopics', jsonFetcher);

  const [topicId, setTopicId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedTopic = topics?.find((t) => t.id === topicId) ?? null;
  const topLevelQuestions =
    selectedTopic?.questions.filter((q) => q.parentId === null) ?? [];

  const setAnswer = (questionId: number, value: string) =>
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!topicId) {
      setError('Сэдэв сонгоно уу.');
      return;
    }
    setSubmitting(true);

    try {
      await axios.post('/api/feedback', {
        topicId,
        name,
        email,
        phone,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId: Number(questionId),
          answer,
        })),
      });
      onDone();
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : null;
      setError(msg || 'Хүсэлт илгээхэд алдаа гарлаа.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Судалгаа бөглөх</h1>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-semibold rounded-r-xl">
          {error}
        </div>
      )}

      <div>
        <label className={labelCls}>Сэдэв</label>
        <select
          value={topicId ?? ''}
          onChange={(e) => {
            setTopicId(e.target.value ? Number(e.target.value) : null);
            setAnswers({});
          }}
          required
          className={inputCls}
        >
          <option value="" disabled>
            Сэдэв сонгоно уу
          </option>
          {topics?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className={labelCls}>Нэр</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
            className={inputCls}
            placeholder="Таны нэр"
          />
        </div>
        <div>
          <label className={labelCls}>Утасны дугаар</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            maxLength={30}
            className={inputCls}
            placeholder="99001122"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Имэйл хаяг</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputCls}
          placeholder="you@example.com"
        />
      </div>

      {topLevelQuestions.map((q) => (
        <QuestionField
          key={q.id}
          question={q}
          allQuestions={selectedTopic?.questions ?? []}
          answers={answers}
          setAnswer={setAnswer}
        />
      ))}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-100 transition-all active:scale-95"
      >
        <FiSend size={16} />
        Илгээх
      </button>
    </form>
  );
}
