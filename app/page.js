'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BODY_MAX, NICKNAME_MAX, SUBMISSIONS_OPEN } from '../lib/config';
import { useCopy } from '../components/CopyProvider';

export default function SubmitPage() {
  const router = useRouter();
  const copy = useCopy();
  const [nickname, setNickname] = useState('');
  const [body, setBody] = useState('');
  const [song, setSong] = useState('');
  const [email, setEmail] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // ハニーポット（人間は触れない）
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!consent) return setError('個人情報を書かないことへの同意にチェックしてください。');
    if (!nickname.trim()) return setError('ニックネームを入力してください。');
    if (!body.trim()) return setError('手紙を入力してください。');
    if (!email.trim()) return setError('メールアドレスを入力してください（いつか、この手紙を読むために必要です）。');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('メールアドレスの形式が正しくありません。');

    setSending(true);
    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, body, email, visibility, consent, website, song }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '送信に失敗しました。');
      // 完了ページの「投稿の控え」用。本人のブラウザ内にだけ一時保存する
      try {
        sessionStorage.setItem('natsu-receipt', JSON.stringify({ nickname: nickname.trim(), email: email.trim() }));
      } catch {}
      router.push('/done');
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">{copy.hero_eyebrow}</p>
          <img className="hero-logo" src="/logo.png" alt="夏のタイムカプセル" width={1500} height={197} />
          <p className="hero-sub-en">{copy.hero_sub_en}</p>
          <p className="hero-meta">{copy.hero_meta}</p>
          <p className="scroll-hint">{copy.scroll_hint}</p>
        </div>
      </section>

      <div className="wrap">
        <section className="section">
          {SUBMISSIONS_OPEN ? (
            <form className="panel" onSubmit={onSubmit}>
              <h2>{copy.form_heading}</h2>
              <p className="muted small" style={{ marginTop: 4, whiteSpace: 'pre-line' }}>
                {copy.form_intro}
              </p>

              {/* ハニーポット: スパムボット除け。人間には見えず、入力されたらサーバー側で破棄する */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
              />

              <label className="field">
                <span className="lab">ニックネーム<span className="req">必須</span></span>
                <input
                  type="text"
                  value={nickname}
                  maxLength={NICKNAME_MAX}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="公開される名前"
                />
              </label>

              <label className="field">
                <span className="lab">いつかの自分への手紙<span className="req">必須</span></span>
                <textarea
                  value={body}
                  maxLength={BODY_MAX}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="今日のこと、これからのこと、*Luna曲との思い出、未来の自分に伝えたいこと。"
                />
                <div className="counter">{body.length} / {BODY_MAX}</div>
              </label>

              <label className="field">
                <span className="lab">思い出の*Luna曲<span className="muted">（任意）</span></span>
                <input
                  type="text"
                  value={song}
                  maxLength={100}
                  onChange={(e) => setSong(e.target.value)}
                  placeholder="曲名を入力"
                />
                <span className="hint">この曲にまつわる思い出を、手紙に添えてみてください。</span>
              </label>

              <label className="field">
                <span className="lab">メールアドレス<span className="req">必須</span></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                />
                <span className="hint">手紙を読むときの本人確認に使います（公開はされません）。</span>
              </label>

              <div className="field">
                <span className="lab">公開設定</span>
                <div className="radio-row">
                  <label className={`radio-pill ${visibility === 'public' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === 'public'}
                      onChange={() => setVisibility('public')}
                    />
                    公開OK
                  </label>
                  <label className={`radio-pill ${visibility === 'private' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === 'private'}
                      onChange={() => setVisibility('private')}
                    />
                    公開しない
                  </label>
                </div>
              </div>

              <div className="notice" style={{ whiteSpace: 'pre-line' }}>
                {copy.notice_text}
              </div>

              <label className="check">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>個人が特定できる情報を書かないことに同意します。</span>
              </label>

              {error && <p className="err">{error}</p>}

              <button className="btn" type="submit" disabled={sending}>
                {sending ? '保存しています…' : copy.submit_button}
              </button>
            </form>
          ) : (
            <div className="panel" style={{ textAlign: 'center' }}>
              <h2>受付は終了しました</h2>
              <p className="muted small">たくさんのご投稿ありがとうございました。いつか開かれる日をお楽しみに。</p>
            </div>
          )}

          <p className="toplinks">
            <a href="/letters">公開ページを見る</a>
          </p>
        </section>
      </div>
    </>
  );
}
