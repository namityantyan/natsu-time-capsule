import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabaseAdmin';
import { isAuthed } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function csvCell(v) {
  if (v === null || v === undefined) return '';
  let s = String(v);
  // CSVインジェクション対策: 数式として解釈されうる先頭文字を無害化する
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

// 全投稿の CSV エクスポート（独立バックアップ用）
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;

    const cols = ['id', 'nickname', 'body', 'email', 'visibility', 'approved', 'hidden', 'created_at'];
    const header = cols.join(',');
    const rows = (data || []).map((r) => cols.map((c) => csvCell(r[c])).join(','));
    // Excel での文字化け防止に BOM を付与
    const csv = '﻿' + [header, ...rows].join('\r\n');

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="time-capsule-letters-${date}.csv"`,
      },
    });
  } catch (e) {
    console.error('export error', e);
    return NextResponse.json({ error: 'エクスポートに失敗しました。' }, { status: 500 });
  }
}
