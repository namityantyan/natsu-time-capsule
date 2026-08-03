import { unstable_cache } from 'next/cache';
import { getTabValues } from './sheets';

const COPY_TAB = 'copy';

// 編集可能な文言の定義（表示順・グループ・ラベル・既定値）。
// キーを増やしたいときは、この配列に1項目足すだけでよい（シート側は自動追従）。
export const COPY_FIELDS = [
  { key: 'hero_eyebrow', group: 'トップ', label: '小見出し（ヒーロー上部・英字）', def: "*Luna's One-Man Live" },
  { key: 'hero_sub_en', group: 'トップ', label: '英語サブタイトル', def: 'SUMMER TIME CAPSULE' },
  { key: 'hero_meta', group: 'トップ', label: '日付・会場', def: '2026.09.12 ・ Spotify O-EAST' },
  { key: 'scroll_hint', group: 'トップ', label: 'スクロール誘導', def: 'scroll — 1年後の自分へ手紙を書く' },
  { key: 'countdown_heading', group: 'トップ', label: 'カウントダウン見出し', def: '開封まで' },
  { key: 'countdown_note', group: 'トップ', label: 'カウントダウン説明', def: '2027年9月12日 00:00 に、このタイムカプセルは開かれます。' },
  { key: 'form_heading', group: 'トップ', label: 'フォーム見出し', def: '1年後の自分への手紙' },
  { key: 'form_intro', group: 'トップ', label: 'フォーム説明', def: 'いまの気持ちを、1年後のあなたへ。投稿は運営の確認後に公開されます。', multiline: true },
  { key: 'submit_button', group: 'トップ', label: '送信ボタン', def: 'タイムカプセルに保存する' },
  { key: 'notice_text', group: 'トップ', label: '注意書き（個人情報）', def: '安全のため、本名・住所・電話番号・学校名・勤務先など、個人が特定できる情報は書かないでください。', multiline: true },
  { key: 'letters_title', group: '公開ページ', label: '見出し', def: '誰かのタイムカプセル' },
  { key: 'draw_button', group: '公開ページ', label: '「別の手紙を引く」ボタン', def: '別の手紙を引く' },
  { key: 'lookup_button', group: '公開ページ', label: '「自分の手紙を見る」ボタン', def: '自分の手紙を見る' },
  { key: 'locked_heading', group: '公開ページ', label: '施錠中の見出し', def: 'まだ鍵がかかっています。' },
  {
    key: 'locked_body',
    group: '公開ページ',
    label: '施錠中の本文',
    def: 'タイムカプセルが開くのは 2027年9月12日 00:00。\nそれまで、手紙はそっと眠っています。',
    multiline: true,
  },
  { key: 'done_heading', group: '完了ページ', label: '見出し', def: 'タイムカプセルに保存されました' },
  {
    key: 'done_body',
    group: '完了ページ',
    label: '本文',
    def: 'あなたの手紙は静かに眠りにつきました。\n2027年9月12日、もう一度ここで会いましょう。',
    multiline: true,
  },
];

export const COPY_DEFAULTS = Object.fromEntries(COPY_FIELDS.map((f) => [f.key, f.def]));

// copy タブ（[key, value] 行）を {key: value} に変換。ヘッダ行・空行は無視。
export function rowsToMap(values) {
  const map = {};
  if (!values) return map;
  for (const row of values) {
    const k = String(row[0] || '').trim();
    if (!k || k === 'key') continue;
    map[k] = row[1] !== undefined ? String(row[1]) : '';
  }
  return map;
}

async function fetchCopyMap() {
  try {
    const values = await getTabValues(COPY_TAB); // 2次元配列 or null（タブ未作成）
    return rowsToMap(values);
  } catch {
    return {};
  }
}

// 30秒キャッシュ。管理画面の保存時に revalidateTag('site-copy') で即時失効させる。
const cachedCopyMap = unstable_cache(fetchCopyMap, ['site-copy'], { tags: ['site-copy'], revalidate: 30 });

// サイト表示用：既定値にシートの上書きをマージして返す（シートが無ければ既定値）。
export async function getCopy() {
  const overrides = await cachedCopyMap();
  return { ...COPY_DEFAULTS, ...overrides };
}
