'use client';
import { useEffect, useState, useCallback } from 'react';

function fmt(iso) {
  try { return new Date(iso).toLocaleString('ja-JP'); } catch { return ''; }
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(null); // null=未確認
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [letters, setLetters] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState('');

  const load = useCallback(async (query = '') => {
    setLoading(true);
    setLoadErr('');
    try {
      const res = await fetch(`/api/admin/letters?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
      if (res.status === 401) { setAuthed(false); return; }
      const data = await res.json();
      setAuthed(true);
      setLetters(data.letters || []);
    } catch {
      // fetch / json 失敗時に「読み込み中…」で固まらないようエラー状態にする
      setAuthed(false);
      setLoadErr('読み込みに失敗しました。通信環境を確認してください。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function login(e) {
    e.preventDefault();
    setLoginErr('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) { setLoginErr(data.error || 'ログインに失敗しました。'); return; }
    setPassword('');
    load();
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
    setLetters([]);
  }

  async function patch(id, body) {
    const res = await fetch(`/api/admin/letters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const { letter } = await res.json();
      setLetters((ls) => ls.map((l) => (l.id === id ? letter : l)));
    }
  }

  async function remove(id) {
    if (!confirm('この投稿を完全に削除します。よろしいですか？')) return;
    const res = await fetch(`/api/admin/letters/${id}`, { method: 'DELETE' });
    if (res.ok) setLetters((ls) => ls.filter((l) => l.id !== id));
  }

  if (authed === null) {
    return <div className="center-page"><p className="muted">読み込み中…</p></div>;
  }

  if (!authed) {
    return (
      <div className="center-page">
        <form className="panel" onSubmit={login} style={{ maxWidth: 420, width: '100%' }}>
          <h2>管理ログイン</h2>
          <label className="field">
            <span className="lab">パスワード</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          </label>
          {loginErr && <p className="err">{loginErr}</p>}
          {loadErr && <p className="err">{loadErr}</p>}
          <button className="btn" type="submit">ログイン</button>
          {loadErr && (
            <button type="button" className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => load()}>
              再試行
            </button>
          )}
        </form>
      </div>
    );
  }

  const stats = {
    total: letters.length,
    approved: letters.filter((l) => l.approved).length,
    pending: letters.filter((l) => !l.approved && !l.hidden).length,
  };

  return (
    <div className="wrap">
      <section className="section" style={{ paddingTop: 50 }}>
        <div className="admin-bar">
          <div>
            <h2 style={{ margin: 0 }}>投稿管理</h2>
            <p className="muted small" style={{ margin: '4px 0 0' }}>
              全 {stats.total} 件 / 承認済 {stats.approved} / 未対応 {stats.pending}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a className="btn btn-ghost" style={{ width: 'auto', padding: '10px 16px' }} href="/api/admin/export">
              CSVエクスポート
            </a>
            <button className="btn btn-ghost" style={{ width: 'auto', padding: '10px 16px' }} onClick={logout}>
              ログアウト
            </button>
          </div>
        </div>

        <form
          className="admin-bar"
          onSubmit={(e) => { e.preventDefault(); load(q); }}
          style={{ justifyContent: 'flex-start' }}
        >
          <input
            type="text"
            placeholder="ニックネーム・本文で検索"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btn-ghost" style={{ width: 'auto', padding: '12px 20px' }} type="submit">検索</button>
          {q && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ width: 'auto', padding: '12px 20px' }}
              onClick={() => { setQ(''); load(''); }}
            >
              クリア
            </button>
          )}
        </form>

        {loading && <p className="muted small">読み込み中…</p>}
        {!loading && letters.length === 0 && <p className="muted small">投稿がありません。</p>}

        {letters.map((l) => (
          <article className="letter-card" key={l.id}>
            <div style={{ marginBottom: 10 }}>
              {l.approved
                ? <span className="badge ok">承認済</span>
                : <span className="badge warn">未承認</span>}
              {l.hidden && <span className="badge warn">非表示</span>}
              {l.visibility === 'private' && <span className="badge priv">公開しない</span>}
            </div>
            <div className="letter-body">{l.body}</div>
            <div className="letter-meta" style={{ fontStyle: 'normal' }}>
              <span>— {l.nickname}{l.email ? ` (${l.email})` : ''}</span>
              <span>{fmt(l.created_at)}</span>
            </div>
            <div className="row-actions">
              <button onClick={() => patch(l.id, { approved: !l.approved })}>
                {l.approved ? '承認を解除' : '承認する'}
              </button>
              <button onClick={() => patch(l.id, { hidden: !l.hidden })}>
                {l.hidden ? '表示に戻す' : '非表示にする'}
              </button>
              <button className="danger" onClick={() => remove(l.id)}>削除</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
