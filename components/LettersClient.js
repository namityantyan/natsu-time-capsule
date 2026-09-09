'use client';
import { useState, useCallback } from 'react';
import MyLetterLookup from './MyLetterLookup';
import { useCopy } from './CopyProvider';

// 公開ページの本体。開封しているか（revealed/preview）はサーバー側で判定して初期値として受け取るため、
// 読み込み中に別の画面が一瞬見えるチラつきが起きない。手紙の取得はボタンを押したときだけ行う。
export default function LettersClient({ initialRevealed = false, initialPreview = false }) {
  const [state, setState] = useState({ loading: false, revealed: initialRevealed, preview: initialPreview, letters: [] });
  const copy = useCopy();
  // 表示モード: idle=2つのボタン / someone=誰かの手紙（ランダム） / mine=自分の手紙（照会フォーム）
  const [view, setView] = useState('idle');

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

        {/* 最初は「誰かの手紙を見る」「自分の手紙を見る」の2択。選んだ方だけを表示し、「閉じる」で戻る。
            各ブロックの外枠は常に描画してツリー位置を固定し、照会フォームの状態が消えないようにする */}
        <div className="portal-actions">
          {view === 'idle' && (
            <button
              className="btn btn-ghost"
              style={{ width: 'auto', padding: '10px 22px' }}
              onClick={() => {
                setView('someone');
                load(); // 新しく1通引く（取得完了時にカードがフェードで現れる）
              }}
            >
              {copy.someone_button}
            </button>
          )}
        </div>

        <div className="portal-someone">
          {view === 'someone' && (
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
                <article className="letter-card enter" key={l.id}>
                  <div className="letter-body">{l.body}</div>
                  {l.song && <div className="letter-song">♪ {l.song}</div>}
                  <div className="letter-meta">
                    <span>— {l.nickname}</span>
                  </div>
                </article>
              ))}

              <div style={{ textAlign: 'center', marginTop: 6 }}>
                <button type="button" className="my-lookup-close" onClick={() => setView('idle')}>閉じる</button>
              </div>
            </>
          )}
        </div>

        <div className={`portal-mine${view === 'idle' ? ' idle' : ''}`}>
          {view !== 'someone' && (
            <MyLetterLookup label={copy.lookup_button} onOpenChange={(v) => setView(v ? 'mine' : 'idle')} />
          )}
        </div>

        <p className="toplinks"><a href="/">手紙を書く</a></p>
      </section>
    </div>
  );
}
