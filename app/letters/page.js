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
  const [state, setState] = useState({ loading: true, revealed: false, letters: [] });
  const [mode, setMode] = useState('list');

  const load = useCallback(async (m) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(`/api/letters?mode=${m}`, { cache: 'no-store' });
      const data = await res.json();
      setState({ loading: false, revealed: !!data.revealed, letters: data.letters || [] });
    } catch {
      setState({ loading: false, revealed: false, letters: [] });
    }
  }, []);

  useEffect(() => { load(mode); }, [mode, load]);

  // 公開前：ロック画面
  if (!state.loading && !state.revealed) {
    return (
      <div className="center-page">
        <div className="panel">
          <div className="icon">🔒</div>
          <h2 style={{ marginTop: 14 }}>まだ鍵がかかっています。</h2>
          <p className="muted small" style={{ marginTop: 10 }}>
            タイムカプセルが開くのは 2027年9月12日 00:00。<br />それまで、手紙はそっと眠っています。
          </p>
          <Countdown />
          <div className="btn-row">
            <a className="btn" href="/">手紙を書く</a>
          </div>
        </div>
      </div>
    );
  }

  // 公開後
  return (
    <div className="wrap">
      <section className="section" style={{ paddingTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <p className="eyebrow">Dear me, one summer later.</p>
          <h2>みんなの手紙</h2>
          <p className="muted small">あの夏、誰かが1年後の自分へ宛てた言葉。</p>
        </div>

        <div className="mode-tabs">
          <button className={mode === 'list' ? 'active' : ''} onClick={() => setMode('list')}>一覧で読む</button>
          <button className={mode === 'random' ? 'active' : ''} onClick={() => setMode('random')}>ランダムに1通</button>
        </div>

        {mode === 'random' && (
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <button className="btn btn-ghost" style={{ width: 'auto', padding: '10px 22px' }} onClick={() => load('random')}>
              別の手紙を引く
            </button>
          </div>
        )}

        {state.loading && <p className="muted small" style={{ textAlign: 'center' }}>読み込み中…</p>}

        {!state.loading && state.letters.length === 0 && (
          <p className="muted small" style={{ textAlign: 'center' }}>まだ公開できる手紙がありません。</p>
        )}

        {state.letters.map((l) => (
          <article className="letter-card" key={l.id}>
            <div className="letter-body">{l.body}</div>
            <div className="letter-meta">
              <span>— {l.nickname}</span>
              <span>{fmt(l.created_at)}</span>
            </div>
          </article>
        ))}

        <p className="toplinks"><a href="/">手紙を書く</a></p>
      </section>
    </div>
  );
}
