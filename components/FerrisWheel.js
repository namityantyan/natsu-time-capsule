// 廃遊園地の観覧車シルエット（キービジュアルの代替。後で key-visual 画像に差し替え可）
export default function FerrisWheel() {
  const spokes = Array.from({ length: 12 }, (_, i) => (i * 360) / 12);
  return (
    <svg className="ferris" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g stroke="var(--gold)" strokeWidth="1.4" opacity="0.9">
        <g className="wheel">
          <circle cx="200" cy="150" r="120" />
          <circle cx="200" cy="150" r="92" />
          <circle cx="200" cy="150" r="6" fill="var(--gold)" />
          {spokes.map((deg, i) => {
            const r = (deg * Math.PI) / 180;
            const x = 200 + Math.cos(r) * 120;
            const y = 150 + Math.sin(r) * 120;
            const gx = 200 + Math.cos(r) * 132;
            const gy = 150 + Math.sin(r) * 132;
            return (
              <g key={i}>
                <line x1="200" y1="150" x2={x} y2={y} />
                <circle cx={gx} cy={gy} r="8" />
              </g>
            );
          })}
        </g>
        {/* 支柱 */}
        <line x1="200" y1="150" x2="150" y2="270" />
        <line x1="200" y1="150" x2="250" y2="270" />
      </g>
      {/* 足元の草 */}
      <g stroke="var(--gold)" strokeWidth="1" opacity="0.5">
        {Array.from({ length: 30 }, (_, i) => {
          const x = 40 + i * 11;
          const h = 8 + ((i * 37) % 16);
          return <line key={i} x1={x} y1="218" x2={x + 2} y2={218 - h} />;
        })}
      </g>
    </svg>
  );
}
