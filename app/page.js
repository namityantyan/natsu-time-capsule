'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Countdown from '../components/Countdown';
import { COPY, BODY_MAX, NICKNAME_MAX } from '../lib/config';

export default function SubmitPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [body, setBody] = useState('');
  const [email, setEmail] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!consent) return setError('個人情報を書かないことへの同意にチェックしてください。');
    if (!nickname.trim()) return setError('ニックネームを入力してください。');
    if (!body.trim()) return setError('手紙を入力してください。');

    setSending(true);
    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, body, email, visibility, consent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '送信に失敗しました。');
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
          <p className="eyebrow">{COPY.eyebrow}</p>
          <h1 className="title">{COPY.title}</h1>
          <p className="sub">{COPY.sub}</p>
          <p className="scroll-hint">scroll — 1年後の自分へ手紙を書く</p>
        </div>
      </section>

      <div className="wrap">
        <section className="section">
          <div className="panel" style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2>開封まで</h2>
            <p className="muted small">2027年9月12日 00:00 に、このタイムカプセルは開かれます。</p>
            <Countdown />
          </div>

          <form className="panel" onSubmit={onSubmit}>
            <h2>1年後の自分への手紙</h2>
            <p className="muted small" style={{ marginTop: 4 }}>
              いまの気持ちを、1年後のあなたへ。投稿は運営の確認後に公開されます。
            </p>

            <label className="field">
              <span className="lab">ニックネーム<span className="req">必須</span></span>
              <input
                type="text"
                value={nickname}
                maxLength={NICKNAME_MAX}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="呼ばれたい名前"
              />
            </label>

            <label className="field">
              <span className="lab">1年後の自分への手紙<span className="req">必須</span></span>
              <textarea
                value={body}
                maxLength={BODY_MAX}
                onChange={(e) => setBody(e.target.value)}
                placeholder="今日のこと、これからのこと、未来の自分に伝えたいこと。"
              />
              <div className="counter">{body.length} / {BODY_MAX}</div>
            </label>

            <label className="field">
              <span className="lab">メールアドレス<span className="muted"> 任意</span></span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="1年後の公開をお知らせします（任意）"
              />
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

            <div className="notice">
              安全のため、本名・住所・電話番号・学校名・勤務先など、個人が特定できる情報は書かないでください。
            </div>

            <label className="check">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>個人が特定できる情報を書かないことに同意します。</span>
            </label>

            {error && <p className="err">{error}</p>}

            <button className="btn" type="submit" disabled={sending}>
              {sending ? '保存しています…' : 'タイムカプセルに保存する'}
            </button>
          </form>

          <p className="toplinks">
            <a href="/letters">公開ページを見る</a>
          </p>
        </section>
      </div>
    </>
  );
}
