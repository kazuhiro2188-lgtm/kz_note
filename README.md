# kz_note

タイムライン型議事録・復習アプリ。学習内容・議事録を「溜める」だけでなく「見返して身につく」ナレッジベース。

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router), TypeScript, TailwindCSS
- **バックエンド**: Next.js API Routes / Server Actions
- **DB**: Supabase (PostgreSQL)
- **認証**: Supabase Auth

## セットアップ

### 1. 依存関係のインストール

```bash
cd kz_note
npm install
```

### 2. 環境変数

`.env.example` をコピーして `.env.local` を作成し、Supabase の認証情報を設定してください。

```bash
cp .env.example .env.local
```

`.env.local` に以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI 機能（Phase 1-2）
ANTHROPIC_API_KEY=your-anthropic-api-key

# RAG 検索・ナレッジチャット（Phase 3）
OPENAI_API_KEY=your-openai-api-key
```

> 本プロジェクトは **kz-code app** Supabase プロジェクトと連携しています。既存の `.env.local` を使用する場合はそのまま利用可能です。

### 3. Supabase 認証設定

**匿名認証（必須）**: ログインなしでアプリを利用するため、匿名認証を有効にしてください。

1. [Supabase Dashboard](https://supabase.com/dashboard) でプロジェクトを開く
2. **Authentication** → **Providers** → **Anonymous** を有効化

> メール・Google OAuth を使う場合は、**Providers** からそれぞれ有効化してください。

### 4. 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリにアクセスできます。

## 実装済み機能

### Phase 1 MVP
- [x] 認証（メール・パスワード、Google OAuth）
- [x] メモ CRUD（投稿・編集・削除・一覧）
- [x] タイムライン表示（時系列）
- [x] AI 自動タイトル・要約生成（Claude API）
- [x] タグ付け・フィルタリング
- [x] ワンクリックコピー
- [x] ダークモード対応

### Phase 2
- [x] Mermaid フローチャート自動生成
- [x] マインドマップ自動生成

### Phase 3
- [x] セマンティック検索（pgvector + OpenAI 埋め込み）
- [x] RAG ナレッジチャット
- [x] 埋め込み自動生成（メモ投稿時・手動トリガー）

## 今後の開発フェーズ

- **Phase 4**: スペースドリピティション
- **Phase 5**: 音声入力・URL 保存・通知

## ディレクトリ構成

```
kz_note/
├── app/
│   ├── (app)/          # 認証必須のメインアプリ
│   │   ├── layout.tsx
│   │   └── page.tsx    # タイムライン
│   ├── auth/callback/  # OAuth コールバック
│   ├── login/          # ログイン・新規登録
│   └── actions/        # Server Actions
├── components/
├── lib/supabase/       # Supabase クライアント
└── types/
```
