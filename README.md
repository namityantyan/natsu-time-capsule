# 夏のタイムカプセル Letter

Luna One-Man Live「夏のタイムカプセル」連動の、来場者参加型Web企画。
来場者が「1年後の自分への手紙」を投稿し、**2027年9月12日 00:00 JST** に公開する。

Next.js (App Router) + Google スプレッドシート（サービスアカウント） + Vercel 構成。

## ページ

| パス | 内容 |
| --- | --- |
| `/` | 投稿ページ（キービジュアル＋フォーム＋カウントダウン） |
| `/done` | 投稿完了ページ |
| `/letters` | 公開ページ（公開日まではロック、公開後は静的JSONの内容を表示） |

## API

| パス | 用途 |
| --- | --- |
| `POST /api/letters` | 手紙の投稿（スプレッドシートの `letters` タブへ1行追記） |
| `GET /api/letters?mode=list\|random` | 公開手紙の取得（公開日以降のみ。`lib/letters-data.json` を返す） |

モデレーション（承認/非承認）はスプレッドシート上で `status` 列を直接編集して行う。管理画面は廃止した。

---

## セットアップ

### 1. Google スプレッドシート＋サービスアカウント作成

1. Google Cloud Console でプロジェクトを作成し、Sheets API を有効化する。
2. サービスアカウントを作成し、鍵（JSON）をダウンロードする。
3. 投稿を保存するスプレッドシートを作成し、1行目に以下のヘッダを入れる（`letters` という名前のタブ）。

   ```
   created_at | nickname | body | song | email | visibility | token | status | sent
   ```

4. スプレッドシートを、サービスアカウントの `client_email`（例: `xxx@yyy.iam.gserviceaccount.com`）に対して編集者として共有する。

### 2. 環境変数

`.env.example` をコピーして `.env.local` を作り、値を入れる。

```bash
cp .env.example .env.local
```

```env
GOOGLE_SERVICE_ACCOUNT_JSON={"client_email":"...","private_key":"...", ...}   # 鍵JSONの中身をそのまま1行で
SHEET_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     # スプレッドシートID
NEXT_PUBLIC_SUBMISSIONS_OPEN=                  # 'false'で投稿受付終了。空なら受付中
```

> `GOOGLE_SERVICE_ACCOUNT_JSON` はサーバー（API Route / bakeスクリプト）でのみ使用。`NEXT_PUBLIC_` を付けないこと。

### 3. ローカル起動

```bash
npm install
npm run dev
```

http://localhost:3000 で投稿を確認。

### 4. Vercel デプロイ

1. GitHubにpush。
2. Vercelで Import し、上記の環境変数を設定。
3. デプロイ。発行URLを関係者に共有してテスト投稿 → スプレッドシートに反映されるか確認。

---

## 運用フロー（投稿 → モデレーション → 公開）

この企画は **投稿(2026年9月) → 約11ヶ月の休眠 → 公開(2027年9月12日)** という構造。

1. イベント後、スプレッドシート上で各行の `status` を `pending` → `approved`/`rejected` に手編集する。
2. `npm run bake` を実行し、`status=approved` かつ `visibility=public` の手紙だけを `lib/letters-data.json` に焼き込む（メール・token等は含まれない）。
3. `lib/letters-data.json` の変更をコミット・pushして公開ポータルに反映する。

詳細は [`静的アーカイブ切替手順.md`](./静的アーカイブ切替手順.md) を参照。

---

## キービジュアルの差し替え

現在はトップの観覧車シルエットを SVG（`components/FerrisWheel.js`）で描画している。
画像に差し替える場合は `public/` に画像を置き、`app/page.js` のヒーロー部分で背景画像として読み込む。

## 公開日の変更

`lib/config.js` の `REVEAL_ISO` を編集する（現状 `2027-09-12T00:00:00+09:00`）。
