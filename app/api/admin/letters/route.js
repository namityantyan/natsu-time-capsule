import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabaseAdmin';
import { isAuthed } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 全投稿を返す（管理用）。検索クエリ ?q= 対応。
export async function GET(req) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  try {
    const supabase = getAdminClient();
    let query = supabase
      .from('letters')
      .select('*')
      .order('created_at', { ascending: false });
    if (q) {
      query = query.or(`nickname.ilike.%${q}%,body.ilike.%${q}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ letters: data || [] });
  } catch (e) {
    console.error('admin list error', e);
    return NextResponse.json({ error: '取得に失敗しました。' }, { status: 500 });
  }
}
