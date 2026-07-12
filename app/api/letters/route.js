import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../lib/supabaseAdmin';
import { isRevealed, BODY_MAX, NICKNAME_MAX } from '../../../lib/config';
import { isAuthed } from '../../../lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 簡易IPレート制限。同一IPから RATE_WINDOW_MS 内に RATE_MAX 件まで。
// 注意: Vercel はインスタンスが揮発するため、このメモリ内カウンタは厳密ではない
// （インスタンスをまたぐと共有されない）。あくまで軽いスパム抑制用。
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 3;
const ipHits = new Map(); // ip -> number[]（直近の投稿時刻）

function rateLimited(ip) {
  if (!ip) return false; // IPが取れなければ制限しない
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

// 手紙を投稿
export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'リクエストが不正です。' }, { status: 400 });
  }

  // ハニーポット: ボットが埋めた場合は保存せず、成功したように 200 を返す
  if (String(payload.website || '').trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ error: '短時間に投稿が集中しています。少し時間をおいてください。' }, { status: 429 });
  }

  const nickname = String(payload.nickname || '').trim();
  const body = String(payload.body || '').trim();
  const email = String(payload.email || '').trim();
  const visibility = payload.visibility === 'private' ? 'private' : 'public';
  const consent = payload.consent === true;

  if (!consent) {
    return NextResponse.json({ error: '個人情報を書かないことへの同意が必要です。' }, { status: 400 });
  }
  if (!nickname || nickname.length > NICKNAME_MAX) {
    return NextResponse.json({ error: `ニックネームは1〜${NICKNAME_MAX}文字で入力してください。` }, { status: 400 });
  }
  if (!body || body.length > BODY_MAX) {
    return NextResponse.json({ error: `手紙は1〜${BODY_MAX}文字で入力してください。` }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'メールアドレスの形式が正しくありません。' }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();
    const { error } = await supabase.from('letters').insert({
      nickname,
      body,
      email: email || null,
      visibility,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('submit error', e);
    return NextResponse.json({ error: '保存に失敗しました。時間をおいて再度お試しください。' }, { status: 500 });
  }
}

// 公開ページ用：公開日以降のみ、公開OK・承認済み・非表示でない手紙を返す
export async function GET(req) {
  const revealed = isRevealed();
  // 公開日前でも、管理者ログイン中はプレビュー表示できる
  const preview = !revealed && isAuthed();
  if (!revealed && !preview) {
    return NextResponse.json({ revealed: false, preview: false, letters: [] });
  }
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') === 'random' ? 'random' : 'list';

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('letters')
      .select('id, nickname, body, created_at')
      .eq('visibility', 'public')
      .eq('approved', true)
      .eq('hidden', false)
      .order('created_at', { ascending: false });
    if (error) throw error;

    let letters = data || [];
    if (mode === 'random' && letters.length > 0) {
      letters = [letters[Math.floor(Math.random() * letters.length)]];
    }
    return NextResponse.json({ revealed, preview, letters });
  } catch (e) {
    console.error('list error', e);
    return NextResponse.json({ error: '取得に失敗しました。' }, { status: 500 });
  }
}
