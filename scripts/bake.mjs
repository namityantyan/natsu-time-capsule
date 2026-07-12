// 公開対象の手紙を lib/letters-data.json に焼き込むスクリプト。
// 実行: npm run bake
// 前提: /admin でのモデレーション（承認/非表示）が完了していること。
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

async function loadEnv() {
  try {
    const { loadEnvConfig } = await import('@next/env');
    loadEnvConfig(process.cwd());
  } catch {
    // フォールバック: .env.local を最小パースする
    try {
      const { readFileSync, existsSync } = await import('node:fs');
      const envPath = path.join(process.cwd(), '.env.local');
      if (existsSync(envPath)) {
        const text = readFileSync(envPath, 'utf8');
        for (const line of text.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eq = trimmed.indexOf('=');
          if (eq === -1) continue;
          const key = trimmed.slice(0, eq).trim();
          let value = trimmed.slice(eq + 1).trim();
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          if (!(key in process.env)) process.env[key] = value;
        }
      }
    } catch (e) {
      console.error('env読み込みに失敗しました:', e);
    }
  }
}

async function main() {
  await loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      'Supabase の環境変数が未設定です（NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）。.env.local を確認してください。'
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('letters')
    .select('id, nickname, body, created_at')
    .eq('visibility', 'public')
    .eq('approved', true)
    .eq('hidden', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('取得に失敗しました:', error);
    process.exit(1);
  }

  const letters = data || [];
  const outPath = path.join(process.cwd(), 'lib', 'letters-data.json');
  writeFileSync(outPath, JSON.stringify(letters, null, 2) + '\n', 'utf8');

  console.log(`焼き込み完了: ${letters.length} 件を ${outPath} に書き出しました。`);
}

main().catch((e) => {
  console.error('bake に失敗しました:', e);
  process.exit(1);
});
