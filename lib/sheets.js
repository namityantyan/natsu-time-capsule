// Google スプレッドシートをデータストアとして使うための薄いユーティリティ。
// サービスアカウント（JWT）で認証し、Sheets REST API を直接叩く。
// 注意: 環境変数はモジュール読み込み時ではなく、各関数の呼び出し時に読む。
// こうすることで、鍵が未設定の環境（例: ビルド時）でも import しただけでは落ちない。

import { JWT } from 'google-auth-library';

const SHEET_TAB = 'letter';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let cachedClient = null;

function getServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON が未設定です。');
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON の形式が不正です（JSONとしてパースできません）。');
  }
  const { client_email, private_key } = parsed;
  if (!client_email || !private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON に client_email / private_key が含まれていません。');
  }
  // JSON.parse で改行は正しく復元される想定だが、環境によって \\n のまま残る場合のフォールバック
  const key = private_key.includes('\\n') ? private_key.replace(/\\n/g, '\n') : private_key;
  return { client_email, private_key: key };
}

function getSheetId() {
  const id = process.env.SHEET_ID;
  if (!id) {
    throw new Error('SHEET_ID が未設定です。');
  }
  return id;
}

function getClient() {
  if (cachedClient) return cachedClient;
  const { client_email, private_key } = getServiceAccount();
  cachedClient = new JWT({ email: client_email, key: private_key, scopes: SCOPES });
  return cachedClient;
}

async function getAccessToken() {
  const client = getClient();
  const { token } = await client.getAccessToken();
  if (!token) {
    throw new Error('Google アクセストークンの取得に失敗しました。');
  }
  return token;
}

// letters タブの末尾へ1行追記する。values は列順（A〜I）の配列で渡す。
export async function appendRow(values) {
  const sheetId = getSheetId();
  const token = await getAccessToken();
  const range = encodeURIComponent(`${SHEET_TAB}!A:I`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [values] }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Sheets append に失敗しました (${res.status}): ${text}`);
  }
  return res.json();
}

// letters タブの全行を取得し、ヘッダ行をキーにしたオブジェクト配列で返す（空行は除外）。
export async function getRows() {
  const sheetId = getSheetId();
  const token = await getAccessToken();
  const range = encodeURIComponent(SHEET_TAB);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Sheets get に失敗しました (${res.status}): ${text}`);
  }

  const data = await res.json();
  const rows = data.values || [];
  if (rows.length === 0) return [];

  const [header, ...body] = rows;
  return body
    .filter((row) => row.some((cell) => String(cell || '').trim() !== ''))
    .map((row) => {
      const obj = {};
      header.forEach((key, i) => {
        obj[key] = row[i] !== undefined ? row[i] : '';
      });
      return obj;
    });
}
