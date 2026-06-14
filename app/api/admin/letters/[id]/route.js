import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../../../lib/supabaseAdmin';
import { isAuthed } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 承認 / 承認解除・非表示 / 表示の切り替え
export async function PATCH(req, { params }) {
  if (!isAuthed()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'リクエストが不正です。' }, { status: 400 });
  }

  const patch = {};
  if (typeof payload.approved === 'boolean') patch.approved = payload.approved;
  if (typeof payload.hidden === 'boolean') patch.hidden = payload.hidden;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: '更新項目がありません。' }, { status: 400 });
  }

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('letters')
      .update(patch)
      .eq('id', params.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ letter: data });
  } catch (e) {
    console.error('patch error', e);
    return NextResponse.json({ error: '更新に失敗しました。' }, { status: 500 });
  }
}

// 削除
export async function DELETE(req, { params }) {
  if (!isAuthed()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const supabase = getAdminClient();
    const { error } = await supabase.from('letters').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('delete error', e);
    return NextResponse.json({ error: '削除に失敗しました。' }, { status: 500 });
  }
}
