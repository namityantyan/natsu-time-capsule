import { NextResponse } from 'next/server';
import { getAdminClient } from '../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// keep-alive: 外部監視サービスから定期的に叩く。実際にDBへ触れることで
// Supabase 無料枠の「7日無アクティビティ自動停止」を防ぐ。
export async function GET(req) {
  const required = process.env.HEALTH_TOKEN;
  if (required) {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('token') !== required) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
  }

  try {
    const supabase = getAdminClient();
    const { count, error } = await supabase
      .from('letters')
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    return NextResponse.json({ ok: true, count: count ?? 0, at: new Date().toISOString() });
  } catch (e) {
    console.error('health error', e);
    return NextResponse.json({ ok: false, error: 'db_unreachable' }, { status: 500 });
  }
}
