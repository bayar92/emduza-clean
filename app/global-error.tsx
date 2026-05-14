'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="mn">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Системийн алдаа</h2>
            <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
              Гэнэтийн алдаа гарлаа. Хэсэг хугацааны дараа дахин оролдоно уу.
            </p>
            <button
              onClick={reset}
              style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 0, borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Дахин оролдох
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
