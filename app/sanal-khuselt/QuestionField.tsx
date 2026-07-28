'use client';

type QuestionType = 'TEXT' | 'YES_NO' | 'MULTIPLE_CHOICE' | 'MULTIPLE_CHOICE_FOLLOWUP';

type Question = {
  id: number;
  parentId: number | null;
  triggerValue: string | null;
  type: QuestionType;
  text: string;
  options: string[] | null;
};

const inputCls =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm bg-white placeholder:text-slate-300';
const labelCls = 'block text-[13px] font-semibold text-slate-700 mb-2';

export default function QuestionField({
  question,
  allQuestions,
  answers,
  setAnswer,
}: {
  question: Question;
  allQuestions: Question[];
  answers: Record<number, string>;
  setAnswer: (questionId: number, value: string) => void;
}) {
  const value = answers[question.id] ?? '';
  const followUpFor = (triggerValue: string) =>
    allQuestions.find(
      (q) => q.parentId === question.id && q.triggerValue === triggerValue
    ) ?? null;

  const renderFollowUp = (triggerValue: string) => {
    const followUp = followUpFor(triggerValue);
    if (!followUp) return null;
    return (
      <div className="mt-4 ml-4 pl-4 border-l-2 border-brand-100">
        <QuestionField
          question={followUp}
          allQuestions={allQuestions}
          answers={answers}
          setAnswer={setAnswer}
        />
      </div>
    );
  };

  return (
    <div>
      <label className={labelCls}>{question.text}</label>

      {question.type === 'TEXT' && (
        <textarea
          value={value}
          onChange={(e) => setAnswer(question.id, e.target.value)}
          rows={3}
          className={inputCls}
        />
      )}

      {question.type === 'YES_NO' && (
        <>
          <div className="flex gap-3">
            {['Тийм', 'Үгүй'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAnswer(question.id, opt)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  value === opt
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {value && renderFollowUp(value)}
        </>
      )}

      {(question.type === 'MULTIPLE_CHOICE' ||
        question.type === 'MULTIPLE_CHOICE_FOLLOWUP') && (
        <>
          <div className="space-y-2">
            {(question.options ?? []).map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                  value === opt
                    ? 'bg-brand-50 border-brand-400'
                    : 'bg-white border-slate-200 hover:border-brand-200'
                }`}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  checked={value === opt}
                  onChange={() => setAnswer(question.id, opt)}
                  className="accent-brand-600"
                />
                <span className="text-sm text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
          {question.type === 'MULTIPLE_CHOICE_FOLLOWUP' && value && renderFollowUp(value)}
        </>
      )}
    </div>
  );
}
