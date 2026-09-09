'use client';
import { useEffect, useState, useCallback } from 'react';
import MyLetterLookup from '../../components/MyLetterLookup';
import { useCopy } from '../../components/CopyProvider';

export default function LettersPage() {
  const [state, setState] = useState({ loading: true, revealed: false, preview: false, letters: [] });
  const copy = useCopy();
  const [lookupOpen, setLookupOpen] = useState(false); // 「自分の手紙を見る」を開いている間は true
  // 「閉じる」で戻った直後は、隠していたカードをフェードなしで即表示する（再マウント時にIOが効かないため）
  const [returned, setReturned] = useState(false);

  // 常にランダムに1通だけ引く
  const load = useCallback(async () => {
    setReturned(false); // 新しく引いた手紙は従来どおりフェードで現す
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
        <div className="scene-grain" aria-hidden="true" />
        <div className="panel">
          <div className="icon">🔒</div>
          <h2 style={{ marginTop: 14 }}>{copy.locked_heading}</h2>
          <p className="muted small" style={{ marginTop: 10, whiteSpace: 'pre-line' }}>
            {copy.locked_body}
          </p>
          <div className="btn-row">
            <a className="btn" href="/">手紙を書く</a>
          </div>
          <MyLetterLookup label={copy.lookup_button} />
        </div>
      </div>
    );
  }

  // 公開後
  return (
    <div className="wrap letters-scene">
      <div className="scene-grain" aria-hidden="true" />
      <section className="section" style={{ paddingTop: 60 }}>
        {state.preview && (
          <div className="preview-banner">
            プレビュー表示中（テスト用）。まだ一般には公開されていません。
          </div>
        )}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <h2>{copy.letters_title}</h2>
        </div>

        {/* 「自分の手紙を見る」を開いている間は、ランダムの手紙と引き直しボタンを隠して自分の手紙に集中させる */}
        {!lookupOpen && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <button className="btn btn-ghost" style={{ width: 'auto', padding: '10px 22px' }} onClick={() => load()}>
                {copy.draw_button}
              </button>
            </div>

            {state.loading && <p className="muted small" style={{ textAlign: 'center' }}>読み込み中…</p>}

            {!state.loading && state.letters.length === 0 && (
              <p className="muted small" style={{ textAlign: 'center' }}>まだ公開できる手紙がありません。</p>
            )}

            {state.letters.map((l) => (
              <article className={returned ? 'letter-card' : 'letter-card reveal'} key={l.id}>
                <div className="letter-body">{l.body}</div>
                {l.song && <div className="letter-song">♪ {l.song}</div>}
                <div className="letter-meta">
                  <span>— {l.nickname}</span>
                </div>
              </article>
            ))}
          </>
        )}

        <MyLetterLookup
          label={copy.lookup_button}
          onOpenChange={(v) => {
            setLookupOpen(v);
            if (!v) setReturned(true);
          }}
        />

        <p className="toplinks"><a href="/">手紙を書く</a></p>
      </section>
    </div>
  );
}
