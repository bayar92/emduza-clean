'use client';

import { useState } from 'react';
import axios from 'axios';
import { useDialog } from '@/components/useDialog';
import { FiTrash2, FiSave, FiPlus, FiX, FiCornerDownRight } from 'react-icons/fi';

export type QuestionType =
  | 'TEXT'
  | 'YES_NO'
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_CHOICE_FOLLOWUP';

export type Question = {
  id: number;
  topicId: number;
  parentId: number | null;
  triggerValue: string | null;
  type: QuestionType;
  text: string;
  options: string[] | null;
  order: number;
};

const TYPE_LABELS: Record<QuestionType, string> = {
  TEXT: 'Асуулт',
  YES_NO: 'Тийм / Үгүй',
  MULTIPLE_CHOICE: 'Олон сонголт',
  MULTIPLE_CHOICE_FOLLOWUP: 'Нэмэлт асуулттай олон сонголт',
};

const inputCls =
  'w-full border border-gray-200 rounded-xl px-4 py-3 text-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm bg-gray-50/50 hover:bg-white';
const labelCls = 'block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5';

export default function QuestionEditor({
  question,
  allQuestions,
  topicId,
  onChanged,
}: {
  question: Question;
  allQuestions: Question[];
  topicId: number;
  onChanged: () => void;
}) {
  const { confirm } = useDialog();
  const [type, setType] = useState<QuestionType>(question.type);
  const [text, setText] = useState(question.text);
  const [options, setOptions] = useState<string[]>(
    question.options && question.options.length ? question.options : ['', '']
  );
  const [saving, setSaving] = useState(false);

  const isMultipleChoice = type === 'MULTIPLE_CHOICE' || type === 'MULTIPLE_CHOICE_FOLLOWUP';
  const followUps = allQuestions.filter((q) => q.parentId === question.id);
  const followUpFor = (triggerValue: string) =>
    followUps.find((q) => q.triggerValue === triggerValue) ?? null;

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/feedbackQuestions?id=${question.id}`, {
        text,
        type,
        options: isMultipleChoice ? options.filter((o) => o.trim()) : undefined,
      });
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!(await confirm('Энэ асуултыг устгах уу? Дотор нь байгаа нэмэлт асуулт ч устана.')))
      return;
    await axios.delete(`/api/feedbackQuestions?id=${question.id}`);
    onChanged();
  };

  const addFollowUp = async (triggerValue: string) => {
    await axios.post('/api/feedbackQuestions', {
      topicId,
      parentId: question.id,
      triggerValue,
      type: 'TEXT',
      text: '',
      order: 0,
    });
    onChanged();
  };

  const removeFollowUp = async (id: number) => {
    if (!(await confirm('Энэ нэмэлт асуултыг устгах уу?'))) return;
    await axios.delete(`/api/feedbackQuestions?id=${id}`);
    onChanged();
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-5 bg-white space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-4">
          <div>
            <label className={labelCls}>Төрөл</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as QuestionType)}
              className={inputCls}
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Асуулт</label>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={inputCls}
              placeholder="Асуултын текст..."
            />
          </div>

          {isMultipleChoice && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls}>Сонголтууд</label>
                <button
                  type="button"
                  onClick={() => setOptions((o) => [...o, ''])}
                  className="flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-700"
                >
                  <FiPlus size={13} /> Сонголт нэмэх
                </button>
              </div>
              <div className="space-y-2">
                {options.map((opt, i) => {
                  const savedOpt = question.options?.[i];
                  const followUp =
                    type === 'MULTIPLE_CHOICE_FOLLOWUP' && savedOpt
                      ? followUpFor(savedOpt)
                      : null;
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-2">
                        <input
                          value={opt}
                          onChange={(e) =>
                            setOptions((o) =>
                              o.map((v, idx) => (idx === i ? e.target.value : v))
                            )
                          }
                          className={inputCls}
                          placeholder={`Сонголт ${i + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => setOptions((o) => o.filter((_, idx) => idx !== i))}
                          className="p-2 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                        >
                          <FiX size={15} />
                        </button>
                      </div>
                      {type === 'MULTIPLE_CHOICE_FOLLOWUP' && savedOpt && (
                        <div className="ml-6 mt-2">
                          {followUp ? (
                            <div className="flex items-start gap-2">
                              <FiCornerDownRight className="text-gray-300 mt-4 flex-shrink-0" />
                              <div className="flex-1">
                                <QuestionEditor
                                  question={followUp}
                                  allQuestions={allQuestions}
                                  topicId={topicId}
                                  onChanged={onChanged}
                                />
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addFollowUp(savedOpt)}
                              className="flex items-center gap-1 text-[12px] font-bold text-blue-500 hover:text-blue-700"
                            >
                              <FiPlus size={12} /> Нэмэлт асуулт
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {type === 'YES_NO' && (
            <div className="ml-2">
              {followUpFor('Тийм') ? (
                <div className="flex items-start gap-2">
                  <FiCornerDownRight className="text-gray-300 mt-4 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      &quot;Тийм&quot; сонгосон үед доор гарах нэмэлт асуулт
                    </p>
                    <QuestionEditor
                      question={followUpFor('Тийм')!}
                      allQuestions={allQuestions}
                      topicId={topicId}
                      onChanged={onChanged}
                    />
                    <button
                      type="button"
                      onClick={() => removeFollowUp(followUpFor('Тийм')!.id)}
                      className="text-[12px] font-bold text-red-500 hover:text-red-700"
                    >
                      Нэмэлт асуултыг устгах
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => addFollowUp('Тийм')}
                  className="flex items-center gap-1 text-[12px] font-bold text-blue-500 hover:text-blue-700"
                >
                  <FiPlus size={12} /> &quot;Тийм&quot; сонгосон үед гарах нэмэлт асуулт
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
            title="Хадгалах"
          >
            <FiSave size={15} />
          </button>
          <button
            type="button"
            onClick={remove}
            className="p-2 text-red-500 bg-red-50/50 rounded-lg hover:bg-red-500 hover:text-white transition-all"
            title="Устгах"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
