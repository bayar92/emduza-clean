'use client';

import { FaFacebook } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface Props {
  title: string;
}

export default function ShareButtons({ title }: Props) {
  const share = (platform: 'facebook' | 'x') => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);

    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    };

    window.open(links[platform], '_blank', 'width=600,height=480,noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
        Хуваалцах
      </span>
      <button
        onClick={() => share('facebook')}
        aria-label="Facebook-т хуваалцах"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-colors"
      >
        <FaFacebook size={14} />
        Facebook
      </button>
      <button
        onClick={() => share('x')}
        aria-label="X-т хуваалцах"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-gray-800 text-white text-xs font-bold transition-colors"
      >
        <FaXTwitter size={14} />X
      </button>
    </div>
  );
}
