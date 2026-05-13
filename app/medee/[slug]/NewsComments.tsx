'use client';

import { useEffect, useState } from 'react';
import { FiMessageSquare, FiThumbsUp, FiThumbsDown, FiSend, FiUser } from 'react-icons/fi';

interface NewsCommentsProps {
  newsId: number;
}

interface Comment {
  id: number;
  content: string;
  name: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  newsId: number;
}

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export default function NewsComments({ newsId }: NewsCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?newsId=${newsId}`)
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, [newsId]);

  const submitComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content: comment, newsId }),
    });
    if (res.ok) {
      const c: Comment = await res.json();
      setComments([c, ...comments]);
      setName('');
      setComment('');
    }
    setSubmitting(false);
  };

  const like = async (id: number) => {
    const res = await fetch(`/api/comments/${id}/like`, { method: 'POST' });
    const updated: Comment = await res.json();
    setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const dislike = async (id: number) => {
    const res = await fetch(`/api/comments/${id}/dislike`, { method: 'POST' });
    const updated: Comment = await res.json();
    setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-6 bg-blue-600 rounded-full" />
        <h3 className="text-[16px] font-black text-gray-800 uppercase tracking-tight">
          Сэтгэгдэл
        </h3>
        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-black rounded-full">
          {comments.length}
        </span>
      </div>

      {/* Comment list */}
      {comments.length === 0 ? (
        <div className="text-center py-4 text-gray-400 text-sm">
          <FiMessageSquare size={22} className="mx-auto mb-1.5 opacity-30" />
          Сэтгэгдэл байхгүй байна
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FiUser size={14} className="text-blue-600" />
                  </div>
                  <span className="text-[13px] font-bold text-gray-800">{c.name}</span>
                </div>
                <span className="text-[11px] text-gray-400">{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-[13px] text-gray-700 leading-relaxed ml-10">{c.content}</p>
              <div className="flex items-center gap-3 mt-3 ml-10">
                <button
                  onClick={() => like(c.id)}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <FiThumbsUp size={13} />
                  <span>{c.likes}</span>
                </button>
                <button
                  onClick={() => dislike(c.id)}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FiThumbsDown size={13} />
                  <span>{c.dislikes}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <div className="border-t border-gray-100 pt-6">
        <h4 className="text-[12px] font-black text-gray-500 uppercase tracking-[0.15em] mb-4">
          Сэтгэгдэл үлдээх
        </h4>
        <form onSubmit={submitComment} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Таны нэр"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Сэтгэгдэлээ бичнэ үү..."
            rows={4}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiSend size={14} />
            {submitting ? 'Илгээж байна...' : 'Илгээх'}
          </button>
        </form>
      </div>
    </div>
  );
}
