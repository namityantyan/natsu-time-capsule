import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { COPY_FIELDS, rowsToMap } from '../../../../lib/copy';
import { getTabValues, writeTab } from '../../../../lib/sheets';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// パスワード試行のレート制限（総当たり抑止）。
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 10;
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

function authOk(req) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return (req.headers.get('x-admin-password') || '') === pw;
}

function guard(req) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD が未設定です。環境変数を設定してください。' }, { status: 500 });
  }
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ error: '試行が集中しています。少し時間をおいてください。' }, { status: 429 });
  }
  if (!authOk(req)) {
    return NextResponse.json({ error: 'パスワードが違います。' }, { status: 401 });
  }
  return null;
}

// 現在の文言（既定値にシートの上書きをマージ）をフィールド定義つきで返す。
export async function GET(req) {
  const blocked = guard(req);
  if (blocked) return blocked;

  let overrides = {};
  try {
    overrides = rowsToMap(await getTabValues('copy'));
  } catch {
    overrides = {};
  }
  const fields = COPY_FIELDS.map((f) => ({
    key: f.key,
    group: f.group,
    label: f.label,
    multiline: !!f.multiline,
    value: overrides[f.key] ?? f.def,
  }));
  return NextResponse.json({ fields });
}

// 送られた文言でシートの copy タブを上書きし、キャッシュを即時失効させる。
export async function POST(req) {
  const blocked = guard(req);
  if (blocked) return blocked;

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'リクエストが不正です。' }, { status: 400 });
  }
  const values = payload && payload.values;
  if (!values || typeof values !== 'object') {
    return NextResponse.json({ error: '保存データがありません。' }, { status: 400 });
  }

  // 既知キーのみを [key, value] 行に（未知キーは無視、未指定は既定値）。
  const rows = [['key', 'value']];
  for (const f of COPY_FIELDS) {
    const v = values[f.key];
    rows.push([f.key, typeof v === 'string' ? v : f.def]);
  }

  try {
    await writeTab('copy', rows);
    revalidateTag('site-copy');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('admin copy save error', e);
    return NextResponse.json({ error: '保存に失敗しました。時間をおいて再度お試しください。' }, { status: 500 });
  }
}
