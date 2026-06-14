# 夏のタイムカプセル Letter

Luna One-Man Live「夏のタイムカプセル」連動の、来場者参加型Web企画。
来場者が「1年後の自分への手紙」を投稿し、**2027年9月12日 00:00 JST** に公開する。

Next.js (App Router) + Supabase + Vercel 構成の初期版。

## ページ

| パス | 内容 |
| --- | --- |
| `/` | 投稿ページ（キービジュアル＋フォーム＋カウントダウン） |
| `/done` | 投稿完了ページ |
| `/letters` | 公開ページ（公開日まではロック、公開後は承認済みのみ表示） |
| `/admin` | 管理ページ（承認・非表示・削除・CSVエクスポート、簡易パスワード認証） |

## API

| パス | 用途 |
| --- | --- |
| `POST /api/letters` | 手紙の投稿 |
| `GET /api/letters?mode=list\|random` | 公開手紙の取得（公開日以降のみ） |
| `GET /api/health` | keep-alive（DBへ実アクセス）。停止防止に使う |
| `POST /api/admin/login` / `logout` | 管理ログイン |
| `GET /api/admin/letters?q=` | 全投稿取得（検索対応） |
| `PATCH/DELETE /api/admin/letters/:id` | 承認・非表示・削除 |
| `GET /api/admin/export` | 全投稿CSVエクスポート |

---

## セットアップ

### 1. Supabase プロジェクト作成

1. [supabase.com](https://supabase.com) で新規プロジェクトを作成。
2. SQL Editor を開き、`supabase/schema.sql` の内容を貼り付けて実行（`letters` テーブル作成）。
3. Settings > API から `Project URL` / `anon public` / `service_role` キーを控える。

### 2. 環境変数

`.env.example` をコピーして `.env.local` を作り、値を入れる。

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx     # 絶対に公開しない
ADMIN_PASSWORD=好きな管理パスワード
HEALTH_TOKEN=任意のランダム文字列    # keep-alive用（任意）
```

> `SUPABASE_SERVICE_ROLE_KEY` はサーバー（API Route）でのみ使用。`NEXT_PUBLIC_` を付けないこと。

### 3. ローカル起動

```bash
npm install
npm run dev
```

http://localhost:3000 で投稿、`/admin` で管理を確認。

### 4. Vercel デプロイ

1. GitHubにpush。
2. Vercelで Import し、上記4〜5つの環境変数を設定。
3. デプロイ。発行URLを関係者に共有してテスト投稿 → `/admin` で承認・非表示を確認。

---

## データ保護運用（重要）

この企画は **投稿(2026年9月) → 約11ヶ月の休眠 → 公開(2027年9月12日)** という構造。
Supabase無料枠は「7日無アクティビティで自動停止」「自動バックアップなし」のため、運用でカバーする。

### A. 停止防止（keep-alive）

外部監視サービスから `/api/health` を **2〜3日おき** に叩き、DBを起こし続ける。

1. [cron-job.org](https://cron-job.org)（無料）などに登録。
2. 監視URL: `https://<本番URL>/api/health?token=<HEALTH_TOKENの値>`
3. 実行間隔: 2〜3日に1回。
4. 失敗時メール通知をオンにする。

> `/api/health` は実際に `letters` テーブルへ `count` クエリを投げるため、これがアクティビティ扱いになり停止を防げる。Vercel Cron / GitHub Actions はアイドルで自動無効化されうるので主軸にしない。

### B. 独立バックアップ（CSV）

`/admin` の「CSVエクスポート」で全件をダウンロードできる。

保管タイミング:

1. **投稿締切直後**（最重要スナップショット）
2. **毎月1回**（休眠期間中）
3. **公開直前**（最終確認）

保管先は **Google Drive ＋ ローカル** など2か所以上。Supabaseと同一プラットフォーム上には置かない。

### C. 公開前チェック

公開の数週間前に、(a) プロジェクトが稼働中か、(b) DB件数と手元CSVの件数が一致するか確認する。
万一停止していてもダッシュボードから手動再開（約30秒）で復旧可能。

---

## キービジュアルの差し替え

現在はトップの観覧車シルエットを SVG（`components/FerrisWheel.js`）で描画している。
画像に差し替える場合は `public/` に画像を置き、`app/page.js` のヒーロー部分で背景画像として読み込む。

## 公開日の変更

`lib/config.js` の `REVEAL_ISO` を編集する（現状 `2027-09-12T00:00:00+09:00`）。
