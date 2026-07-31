'use client';
import { useState } from 'react';

// 「自分の手紙を見る」照会フォーム。
// 本人確認はメアド＋ニックネームの両方一致（サーバ側で照合）。
// 公開日前は保管件数のみ、公開日後は本文を表示する。
export default function MyLetterLookup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!email.trim() || !nickname.trim()) {
      setError('メールアドレスとニックネームを入力してください。');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/my-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), nickname: nickname.trim() }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || '照会に失敗しました。');
      else setResult(data);
    } catch {
      setError('通信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-lookup">
      {!open && (
        <button type="button" className="btn btn-ghost" style={{ width: 'auto', padding: '10px 22px' }} onClick={() => setOpen(true)}>
          自分の手紙を見る
        </button>
      )}

      {open && (
        <form className="my-lookup-form" onSubmit={onSubmit}>
          <p className="my-lookup-lead">投稿時のメールアドレスとニックネームを入力してください。</p>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="ニックネーム"
            maxLength={30}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button type="submit" className="btn my-lookup-submit" disabled={loading}>
            {loading ? '照会中…' : '確認する'}
          </button>

          {error && <p className="err">{error}</p>}

          {result && !result.revealed && (
            <p className="my-lookup-note">
              {result.count > 0
                ? `「${nickname.trim()}」名義の手紙が ${result.count} 通、大切に保管されています。公開日（2027年9月12日）に、ここで読めます。`
                : 'その組み合わせの手紙は見つかりませんでした。メールアドレスとニックネームをご確認ください。'}
            </p>
          )}

          {result && result.revealed &&
            (result.letters.length > 0 ? (
              <div className="my-lookup-results">
                {result.letters.map((l, i) => (
                  <article className="letter-card" key={i}>
                    <div className="letter-body">{l.body}</div>
                    {l.song && <div className="letter-song">♪ {l.song}</div>}
                    <div className="letter-meta">
                      <span>— {l.nickname}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="my-lookup-note">
                その組み合わせの手紙は見つかりませんでした。メールアドレスとニックネームをご確認ください。
              </p>
            ))}
        </form>
      )}
    </div>
  );
}
