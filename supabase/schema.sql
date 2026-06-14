-- 「夏のタイムカプセル Letter」テーブル定義
-- Supabase の SQL Editor に貼り付けて実行する。

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  body text not null,
  email text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  approved boolean not null default false,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

-- 公開ページの取得を速くするためのインデックス
create index if not exists letters_public_idx
  on public.letters (created_at desc)
  where visibility = 'public' and approved = true and hidden = false;

-- RLS は有効化しておく。アプリ側のDBアクセスはすべてサーバー(API Route)から
-- service role key で行うため、anon からの直接アクセスはポリシー未設定＝拒否のままにする。
alter table public.letters enable row level security;
