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
  const [mode, setMode] = useState('list');
  const [songFilter, setSongFilter] = useState('');

  const load = useCallback(async (m) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(`/api/letters?mode=${m}`, { cache: 'no-store' });
      const data = await res.json();
      setState({ loading: false, revealed: !!data.revealed, preview: !!data.preview, letters: data.letters || [] });
    } catch {
      setState({ loading: false, revealed: false, preview: false, letters: [] });
    }
  }, []);

  useEffect(() => { load(mode); }, [mode, load]);

  // モードを切り替えたら曲フィルタはリセット（ランダム抽出と噛み合わなくなるため）
  useEffect(() => { setSongFilter(''); }, [mode]);

  // 実際に使われている曲の一覧（読み込んだ手紙から抽出、五十音/文字コード順）
  const songOptions = [...new Set(state.letters.map((l) => l.song).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'ja')
  );

  // 選択中の曲があれば、その曲が紐づく手紙だけに絞り込む
  const visibleLetters = songFilter ? state.letters.filter((l) => l.song === songFilter) : state.letters;

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
  }, [state.letters, state.loading, songFilter]);

  // 公開前：ロック画面（管理者ログイン中はプレビュー表示するのでロックしない）
  if (!state.loading && !state.revealed && !state.preview) {
    return (
      <div className="center-page">
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
    <div className="wrap">
      <section className="section" style={{ paddingTop: 60 }}>
        {state.preview && (
          <div className="preview-banner">
            プレビュー表示中（テスト・本番公開日前）。実際の公開は 2027年9月12日 です。
          </div>
        )}
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

        {!state.loading && songOptions.length > 0 && (
          <div className="song-filter">
            <label>
              <span className="lab">♪ この曲に寄せられた手紙</span>
              <select value={songFilter} onChange={(e) => setSongFilter(e.target.value)}>
                <option value="">すべて</option>
                {songOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {state.loading && <p className="muted small" style={{ textAlign: 'center' }}>読み込み中…</p>}

        {!state.loading && visibleLetters.length === 0 && (
          <p className="muted small" style={{ textAlign: 'center' }}>
            {songFilter ? 'この曲に紐づく手紙はまだありません。' : 'まだ公開できる手紙がありません。'}
          </p>
        )}

        {visibleLetters.map((l) => (
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
