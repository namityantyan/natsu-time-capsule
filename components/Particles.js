'use client';
import { useMemo } from 'react';

// 廃園に漂う思い出の落書き（チョークスプライト）が、ゆっくり空へ昇っていく。
// SSR とクライアントで値がズレないよう、シード付き擬似乱数で一度だけ生成。

// クリーム地でも視認できる彩度のあるモチーフに厳選（白系のbird-a/spark/starは
// クリーム背景でほぼ消えるため不採用）。
const SPRITES = [
  'flower',
  'bird-b',
  'heart',
  'butterfly',
  'note-a',
  'note-b',
  'spiral',
  'moon',
  'star-b',
  'rainbow',
];

export default function Particles({ count = 14 }) {
  const items = useMemo(() => {
    const seeded = [];
    let s = 7;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < count; i++) {
      const swaySign = rnd() > 0.5 ? 1 : -1;
      const rotSign = rnd() > 0.5 ? 1 : -1;
      seeded.push({
        left: rnd() * 100,
        delay: -(rnd() * 26), // マイナス遅延で開始時から画面内に散らばらせる
        dur: 15 + rnd() * 15, // 15〜30秒
        size: 40 + rnd() * 48, // 40〜88px
        sprite: SPRITES[Math.floor(rnd() * SPRITES.length)],
        op: 0.5 + rnd() * 0.3, // 0.5〜0.8
        sway: swaySign * (10 + rnd() * 22),
        rot: rotSign * (14 + rnd() * 22),
      });
    }
    return seeded;
  }, [count]);

  return (
    <div className="particles" aria-hidden="true">
      {items.map((p, i) => (
        <img
          key={i}
          className="particle-chalk"
          src={`/doodles/${p.sprite}.png`}
          alt=""
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            opacity: 0,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            '--op': p.op,
            '--sway': `${p.sway}px`,
            '--rot': `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}
