'use client';
import { useEffect, useState } from 'react';
import { REVEAL_ISO } from '../lib/config';

const target = new Date(REVEAL_ISO).getTime();

function diff() {
  const ms = Math.max(0, target - Date.now());
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s, done: ms === 0 };
}

export default function Countdown() {
  const [t, setT] = useState(null);

  useEffect(() => {
    setT(diff());
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  // ハイドレーション不一致を避けるため、初回はプレースホルダ
  const units = t
    ? [
        { n: t.d, l: 'Days' },
        { n: t.h, l: 'Hours' },
        { n: t.m, l: 'Min' },
        { n: t.s, l: 'Sec' },
      ]
    : [
        { n: '—', l: 'Days' },
        { n: '—', l: 'Hours' },
        { n: '—', l: 'Min' },
        { n: '—', l: 'Sec' },
      ];

  return (
    <div className="countdown" suppressHydrationWarning>
      {units.map((u) => (
        <div className="cd-unit" key={u.l}>
          <div className="cd-num">{typeof u.n === 'number' ? String(u.n).padStart(2, '0') : u.n}</div>
          <div className="cd-label">{u.l}</div>
        </div>
      ))}
    </div>
  );
}
