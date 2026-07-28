// 公開対象の手紙を lib/letters-data.json に焼き込むスクリプト。
// 実行: npm run bake
// 前提: スプレッドシート上でモデレーション（status列を pending → approved/rejected）が完了していること。
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { getRows } from '../lib/sheets.js';

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

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || !process.env.SHEET_ID) {
    console.error(
      'Google の環境変数が未設定です（GOOGLE_SERVICE_ACCOUNT_JSON / SHEET_ID）。.env.local を確認してください。'
    );
    process.exit(1);
  }

  const rows = await getRows();

  const letters = rows
    .filter((r) => r.status === 'approved' && r.visibility === 'public')
    .map((r, i) => ({
      id: i + 1,
      nickname: r.nickname || '',
      body: r.body || '',
      created_at: r.created_at || '',
      song: r.song || undefined,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const outPath = path.join(process.cwd(), 'lib', 'letters-data.json');
  writeFileSync(outPath, JSON.stringify(letters, null, 2) + '\n', 'utf8');

  console.log(`焼き込み完了: ${letters.length} 件を ${outPath} に書き出しました。`);
}

main().catch((e) => {
  console.error('bake に失敗しました:', e);
  process.exit(1);
});
