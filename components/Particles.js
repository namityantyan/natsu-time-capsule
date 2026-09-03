'use client';
import { useMemo } from 'react';

// 廃園に漂う思い出の落書き（チョークスプライト）が、ゆっくり空へ昇っていく。
// SSR とクライアントで値がズレないよう、シード付き擬似乱数で一度だけ生成。

// KVイラストから切り出した公式の落書きパーツ（public/doodles/kv-01〜33.png）を使う。
const SPRITES = Array.from({ length: 33 }, (_, i) => `kv-${String(i + 1).padStart(2, '0')}`);

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
        op: 1, // 素材そのままの色味で表示（透過させない）
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
