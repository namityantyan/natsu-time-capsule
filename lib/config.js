// 企画の共通設定

// ライブ当日
export const LIVE_DATE_LABEL = '2026.09.12';

// 手紙本文の文字数上限
export const BODY_MAX = 1000;
export const NICKNAME_MAX = 30;

// タイムカプセルが開かれたか。
// 「いつか」＝日付では決めず、運営が環境変数 LETTERS_OPEN=true にした時点で開封する。
export function isRevealed() {
  return process.env.LETTERS_OPEN === 'true';
}

// 投稿受付が開いているか。未設定なら受付中（現行動作を維持）。
export const SUBMISSIONS_OPEN = process.env.NEXT_PUBLIC_SUBMISSIONS_OPEN !== 'false';
