'use client';
import { useMemo } from 'react';

// 漂う紙吹雪 / 花びら。SSR とクライアントで値がズレないよう一度だけ生成。
export default function Particles({ count = 18 }) {
  const items = useMemo(() => {
    const seeded = [];
    let s = 7;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < count; i++) {
      seeded.push({
        left: rnd() * 100,
        delay: rnd() * 14,
        dur: 12 + rnd() * 16,
        size: 5 + rnd() * 7,
        hue: rnd() > 0.5 ? 'var(--gold)' : 'var(--rose)',
        op: 0.3 + rnd() * 0.35,
      });
    }
    return seeded;
  }, [count]);

  return (
    <div className="particles" aria-hidden="true">
      {items.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.hue,
            opacity: p.op,
          }}
        />
      ))}
    </div>
  );
}
