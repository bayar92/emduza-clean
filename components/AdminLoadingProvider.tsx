'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function AdminLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(false);
  const count = useRef(0);

  const inc = () => {
    count.current += 1;
    setActive(true);
  };

  const dec = () => {
    count.current = Math.max(0, count.current - 1);
    if (count.current === 0) setActive(false);
  };

  useEffect(() => {
    // ── Axios interceptors ─────────────────────────────────
    const req = axios.interceptors.request.use((config) => {
      inc();
      return config;
    });

    const res = axios.interceptors.response.use(
      (response) => { dec(); return response; },
      (error) => { dec(); return Promise.reject(error); }
    );

    // ── Global fetch patch ─────────────────────────────────
    const origFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      inc();
      try {
        const r = await origFetch(...args);
        dec();
        return r;
      } catch (e) {
        dec();
        throw e;
      }
    };

    return () => {
      axios.interceptors.request.eject(req);
      axios.interceptors.response.eject(res);
      window.fetch = origFetch;
    };
  }, []);

  return (
    <>
      {/* Top loading bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-[9999] h-[3px] transition-opacity duration-300 ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`h-full bg-blue-500 ${
            active ? 'animate-loading-bar' : ''
          }`}
        />
      </div>

      {/* Full-screen overlay while loading */}
      {active && (
        <div className="fixed inset-0 z-[9998] bg-white/30 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center gap-3 pointer-events-none">
            <div className="w-5 h-5 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-semibold text-gray-600">Уншиж байна...</span>
          </div>
        </div>
      )}

      {children}
    </>
  );
}
