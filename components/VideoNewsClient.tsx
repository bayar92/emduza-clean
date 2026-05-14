'use client';
import React, { useState } from 'react';
import { FiYoutube, FiPlay } from 'react-icons/fi';

export type VideoItem = {
  id: number;
  title: string;
  videoPath: string;
};

const getVideoPath = (path: string) =>
  path.startsWith('public/') ? `/${path.replace('public/', '')}` : path;

const VideoNewsClient = ({ videos }: { videos: VideoItem[] }) => {
  const [selected, setSelected] = useState<VideoItem | null>(videos[0] ?? null);

  if (videos.length === 0) return null;

  return (
    <section className="py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-100">
          <FiYoutube size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            Видео сан
          </h2>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
            Онцлох видео мэдээллүүд
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-[24px] p-5 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              {selected && (
                <video
                  key={selected.id}
                  controls
                  className="w-full h-full"
                  autoPlay={false}
                >
                  <source
                    src={getVideoPath(selected.videoPath)}
                    type="video/mp4"
                  />
                </video>
              )}
            </div>
            {selected && (
              <h3 className="mt-4 text-base font-bold text-white px-1 line-clamp-2">
                {selected.title}
              </h3>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1 px-1">
              Жагсаалт
            </p>
            {videos.map((video, idx) => {
              const isActive = selected?.id === video.id;
              return (
                <button
                  key={video.id}
                  onClick={() => setSelected(video)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <div
                    className={`w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-white/20' : 'bg-white/10'
                    }`}
                  >
                    {isActive ? (
                      <FiPlay size={12} className="text-white" />
                    ) : (
                      <span className="text-[10px] font-black text-gray-400">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] font-semibold line-clamp-2 leading-snug">
                    {video.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoNewsClient;
