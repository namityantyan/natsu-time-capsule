'use client';
import { useState } from 'react';

// サイト内の文言を編集する管理画面。共有パスワードでログインし、
// 保存するとスプレッドシートの copy タブに書き込まれ、サイトへ数十秒以内に反映される。
export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  async function login(e) {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/copy', { headers: { 'x-admin-password': password } });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'ログインに失敗しました。');
      } else {
        setFields(data.fields);
        setValues(Object.fromEntries(data.fields.map((f) => [f.key, f.value])));
        setAuthed(true);
      }
    } catch {
      setError('通信に失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ values }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || '保存に失敗しました。');
      else setStatus('保存しました。サイトには数十秒以内に反映されます。');
    } catch {
      setError('通信に失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  if (!authed) {
    return (
      <div className="wrap">
        <section className="section" style={{ paddingTop: 60, maxWidth: 420, margin: '0 auto' }}>
          <div className="panel">
            <h2>文言の管理</h2>
            <p className="muted small" style={{ marginTop: 6 }}>管理者パスワードを入力してください。</p>
            <form onSubmit={login}>
              <label className="field">
                <span className="lab">パスワード</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </label>
              {error && <p className="err">{error}</p>}
              <button className="btn" type="submit" disabled={loading}>
                {loading ? '確認中…' : 'ログイン'}
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  // グループごとに項目をまとめる
  const groups = [];
  for (const f of fields) {
    let g = groups.find((x) => x.name === f.group);
    if (!g) {
      g = { name: f.group, items: [] };
      groups.push(g);
    }
    g.items.push(f);
  }

  return (
    <div className="wrap">
      <section className="section" style={{ paddingTop: 48 }}>
        <h2>文言の管理</h2>
        <p className="muted small" style={{ marginTop: 6 }}>
          編集して「保存する」を押すと、サイトへ数十秒以内に反映されます。
        </p>
        <form onSubmit={save}>
          {groups.map((g) => (
            <div className="panel" key={g.name} style={{ marginTop: 20 }}>
              <h3 style={{ margin: '0 0 12px' }}>{g.name}</h3>
              {g.items.map((f) => (
                <label className="field" key={f.key}>
                  <span className="lab">{f.label}</span>
                  {f.multiline ? (
                    <textarea
                      value={values[f.key] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      style={{ minHeight: 88, fontFamily: 'var(--serif-jp)' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[f.key] ?? ''}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    />
                  )}
                </label>
              ))}
            </div>
          ))}
          {error && <p className="err">{error}</p>}
          {status && <p className="muted small" style={{ color: '#2e7d32', marginTop: 12 }}>{status}</p>}
          <div style={{ marginTop: 20 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? '保存中…' : '保存する'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
