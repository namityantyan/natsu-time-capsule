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

// 手紙の受付期限（JST）。この時刻を過ぎると自動で受付終了になる。
export const SUBMISSIONS_DEADLINE_ISO = '2026-09-15T23:59:59+09:00';

// 投稿受付が開いているか。環境変数 NEXT_PUBLIC_SUBMISSIONS_OPEN=false で強制終了できるほか、期限を過ぎたら自動で閉じる。
export function isSubmissionsOpen(now = Date.now()) {
  if (process.env.NEXT_PUBLIC_SUBMISSIONS_OPEN === 'false') return false;
  return now < new Date(SUBMISSIONS_DEADLINE_ISO).getTime();
}
