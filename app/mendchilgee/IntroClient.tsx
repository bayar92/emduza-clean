'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { FiUser } from 'react-icons/fi';

interface IntroData {
  id: number;
  name: string | null;
  image: string | null;
  company: string | null;
}

export default function IntroClient({ intro }: { intro: IntroData }) {
  const [cleanContent, setCleanContent] = useState('');

  useEffect(() => {
    setCleanContent(DOMPurify.sanitize(intro.company ?? ''));
  }, [intro.company]);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 rounded-full bg-blue-600" />
        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">
          Даргын мэндчилгээ
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-[300px] flex-shrink-0">
          <div className="relative w-full aspect-[3/4] uppercase rounded-2xl overflow-hidden bg-gray-100 shadow-md">
            {intro.image ? (
              <img
                src={intro.image}
                alt={intro.name ?? 'Дарга'}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiUser size={48} className="text-gray-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-black text-[14px] leading-tight drop-shadow">
                {intro.name}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#0D47A1] rounded-2xl">
            <ul className="space-y-2 uppercase">
              {[
                'Монгол улсын их хурлын гишүүн',
                'Монгол улсын засгийн газрын гишүүн',
                'Эрүүл мэндийн сайд',
                'ЭМДҮЗ-ийн дарга',
              ].map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0 mt-1.5" />
                  <span className="text-[11px] font-bold text-white leading-snug">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-[14px] [&_p]:mb-4 [&_p]:text-gray-700"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        </div>
      </div>
    </div>
  );
}
