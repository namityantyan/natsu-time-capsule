import { NextResponse } from 'next/server';
import { getRows } from '../../../lib/sheets';
import { isRevealed } from '../../../lib/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 照会のレート制限（IPあたり RATE_WINDOW_MS 内に RATE_MAX 回まで）。
// メアド＋ニックネームの総当たり探索を抑止する。Vercelはインスタンス揮発のため厳密ではない。
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 6;
const ipHits = new Map();

function rateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

const norm = (s) => String(s || '').trim().toLowerCase();

// 自分の手紙の照会。本人確認は「メールアドレス＋ニックネームの両方一致」。
// 公開日前は本文を返さず、保管件数のみ返す（封印コンセプトの維持）。
export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'リクエストが不正です。' }, { status: 400 });
  }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ error: '短時間に検索が集中しています。少し時間をおいてください。' }, { status: 429 });
  }

  const email = String(payload.email || '').trim();
  const nickname = String(payload.nickname || '').trim();
  if (!email || !nickname) {
    return NextResponse.json({ error: 'メールアドレスとニックネームを入力してください。' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'メールアドレスを正しく入力してください。' }, { status: 400 });
  }

  try {
    const rows = await getRows();
    // 本人の手紙 = メアドとニックネームが両方一致し、却下されていないもの
    const matches = rows.filter(
      (r) => norm(r.email) === norm(email) && norm(r.nickname) === norm(nickname) && r.status !== 'rejected'
    );

    // 公開日前：本文は返さず、保管件数のみ（メアド・トークンも一切返さない）
    if (!isRevealed()) {
      return NextResponse.json({ revealed: false, count: matches.length });
    }

    // 公開日後：本人の手紙は公開/非公開を問わず本文を返す
    const letters = matches.map((r) => ({
      nickname: r.nickname || '',
      body: r.body || '',
      song: r.song || undefined,
      created_at: r.created_at || '',
    }));
    return NextResponse.json({ revealed: true, letters });
  } catch (e) {
    console.error('my-letters error', e);
    return NextResponse.json({ error: '照会に失敗しました。時間をおいて再度お試しください。' }, { status: 500 });
  }
}
