import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'tc_admin';

// パスワードから導出したトークン。httpOnly cookie に保存して照合する。
export function adminToken() {
  const pw = process.env.ADMIN_PASSWORD || '';
  return crypto.createHash('sha256').update('natsu-tc::' + pw).digest('hex');
}

export function checkPassword(input) {
  const pw = process.env.ADMIN_PASSWORD || '';
  if (!pw) return false;
  // タイミング攻撃を避けるため固定長で比較
  const a = crypto.createHash('sha256').update(String(input)).digest();
  const b = crypto.createHash('sha256').update(pw).digest();
  return crypto.timingSafeEqual(a, b);
}

export function isAuthed() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return !!token && token === adminToken();
}
