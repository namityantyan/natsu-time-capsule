import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../lib/supabaseAdmin';
import { isRevealed, BODY_MAX, NICKNAME_MAX } from '../../../lib/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 手紙を投稿
export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'リクエストが不正です。' }, { status: 400 });
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
  if (!isRevealed()) {
    return NextResponse.json({ revealed: false, letters: [] });
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
    return NextResponse.json({ revealed: true, letters });
  } catch (e) {
    console.error('list error', e);
    return NextResponse.json({ error: '取得に失敗しました。' }, { status: 500 });
  }
}
