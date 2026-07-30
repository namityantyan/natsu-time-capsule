'use client';
import { useEffect, useState, useCallback } from 'react';
import Countdown from '../../components/Countdown';

function fmt(iso) {
  try {
    return new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function LettersPage() {
  const [state, setState] = useState({ loading: true, revealed: false, preview: false, letters: [] });

  // 常にランダムに1通だけ引く
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch('/api/letters?mode=random', { cache: 'no-store' });
      const data = await res.json();
      setState({ loading: false, revealed: !!data.revealed, preview: !!data.preview, letters: data.letters || [] });
    } catch {
      setState({ loading: false, revealed: false, preview: false, letters: [] });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // 手紙がビューに入ったら、チョークで書かれるように表示する
  useEffect(() => {
    if (state.loading) return;
    const cards = document.querySelectorAll('.letter-card');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('drawn');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [state.letters, state.loading]);

  // 公開前：ロック画面（管理者ログイン中はプレビュー表示するのでロックしない）
  if (!state.loading && !state.revealed && !state.preview) {
    return (
      <div className="center-page letters-scene">
        <div className="panel">
          <div className="icon">🔒</div>
          <h2 style={{ marginTop: 14 }}>まだ鍵がかかっています。</h2>
          <p className="muted small" style={{ marginTop: 10 }}>
            タイムカプセルが開くのは 2027年9月12日 00:00。<br />それまで、手紙はそっと眠っています。
          </p>
          <Countdown reloadOnDone />
          <div className="btn-row">
            <a className="btn" href="/">手紙を書く</a>
          </div>
        </div>
      </div>
    );
  }

  // 公開後
  return (
    <div className="wrap letters-scene">
      <section className="section" style={{ paddingTop: 60 }}>
        {state.preview && (
          <div className="preview-banner">
            プレビュー表示中（テスト・本番公開日前）。実際の公開は 2027年9月12日 です。
          </div>
        )}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h2>誰かのタイムカプセル</h2>
          <p className="muted small">あの夏、誰かが1年後の自分へ宛てた言葉を、ランダムに1通。</p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <button className="btn btn-ghost" style={{ width: 'auto', padding: '10px 22px' }} onClick={() => load()}>
            別の手紙を引く
          </button>
        </div>

        {state.loading && <p className="muted small" style={{ textAlign: 'center' }}>読み込み中…</p>}

        {!state.loading && state.letters.length === 0 && (
          <p className="muted small" style={{ textAlign: 'center' }}>まだ公開できる手紙がありません。</p>
        )}

        {state.letters.map((l) => (
          <article className="letter-card reveal" key={l.id}>
            <div className="letter-body">{l.body}</div>
            {l.song && <div className="letter-song">♪ {l.song}</div>}
            <div className="letter-meta">
              <span>— {l.nickname}</span>
              <span className="date">{fmt(l.created_at)}</span>
            </div>
          </article>
        ))}

        <p className="toplinks"><a href="/">手紙を書く</a></p>
      </section>
    </div>
  );
}
