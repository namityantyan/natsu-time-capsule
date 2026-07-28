// 企画の共通設定

// 公開日（タイムカプセル開封）: 2027年9月12日 00:00 JST
export const REVEAL_ISO = '2027-09-12T00:00:00+09:00';

// ライブ当日
export const LIVE_DATE_LABEL = '2026.09.12';

// 手紙本文の文字数上限
export const BODY_MAX = 1000;
export const NICKNAME_MAX = 30;

// 公開日を過ぎたか
export function isRevealed(now = Date.now()) {
  return now >= new Date(REVEAL_ISO).getTime();
}

// 投稿受付が開いているか。未設定なら受付中（現行動作を維持）。
export const SUBMISSIONS_OPEN = process.env.NEXT_PUBLIC_SUBMISSIONS_OPEN !== 'false';

// トップコピー
export const COPY = {
  eyebrow: "*Luna's One-Man Live",
  title: '夏のタイムカプセル',
  sub: 'Dear me, one summer later.',
};
