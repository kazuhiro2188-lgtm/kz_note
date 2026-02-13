# kz_note 本番デプロイ手順

## 前提条件

- Vercel アカウント
- Supabase プロジェクト（kz-code app）
- GitHub リポジトリ（推奨）

---

## Step 0: GitHub リポジトリの作成とリモート設定

`git push` で「No configured push destination」と出る場合、リモートが未設定です。

### 1. GitHub でリポジトリを作成

1. [GitHub](https://github.com/new) で **New repository** をクリック
2. リポジトリ名を入力（例: `kz_note`）
3. **Create repository** をクリック
4. 作成後、表示される **HTTPS** の URL をコピー（例: `https://github.com/あなたのユーザー名/kz_note.git`）

### 2. リモートを追加して push

```bash
cd /Users/ishiharakazuhiro/kz_note   # プロジェクトのルート（.git がある場所）

# リモートを追加
git remote add origin https://github.com/あなたのユーザー名/kz_note.git

# 初回 push（ブランチ名は main または master）
git push -u origin main
```

ブランチ名が `master` の場合は:

```bash
git push -u origin master
```

### 3. 2回目以降の push

```bash
git push
```

---

## Step 1: Vercel にプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. **Add New** → **Project**
3. GitHub リポジトリを選択（または `vercel` CLI でデプロイ）
4. **Root Directory** の設定（下記「Root Directory とは」を参照）
5. **Framework Preset:** Next.js（自動検出）
6. 一旦 **Deploy** は押さず、環境変数を先に設定

---

### Root Directory とは

**Root Directory** は「Vercel が `npm install` と `npm run build` を実行するフォルダ」を指定する設定です。

#### あなたのプロジェクト構成（重要）

**Git のルート = package.json があるフォルダ** です。

```
kz_note/kz_note/            ← これが Git のルート（GitHub に push される内容）
├── package.json
├── next.config.ts
├── app/
├── components/
└── ...
```

GitHub 上では **package.json がリポジトリのルート直下** にあります。  
→ **Root Directory は空欄のまま** にしてください。`kz_note` と入力するとビルドが失敗します。

#### 設定方法

**方法A: プロジェクト作成時（初回インポート）**

1. **Add New** → **Project** でリポジトリを選択
2. リポジトリ選択後、**Configure Project** 画面が表示される
3. **Root Directory** は **空欄のまま** にしてください（package.json がリポジトリルートにあるため）
4. **Deploy** をクリック

**方法B: 既存プロジェクトの設定変更（Root Directory を `kz_note` にしていた場合）**

1. Vercel ダッシュボードで対象プロジェクトをクリック
2. 上部タブの **Settings** をクリック
3. 左メニューの **Build and Deployment** をクリック
4. ページを下にスクロールし、**Root Directory** セクションを探す
5. 入力欄を **空にする**（`kz_note` が入っていたら削除）
6. **Save** をクリック
7. 再デプロイを実行（**Deployments** タブ → 最新デプロイの **...** → **Redeploy**）

#### 設定しないとどうなる？

- **Root Directory を空欄** → リポジトリのルートでビルド（あなたの構成では正しい）
- **Root Directory を `kz_note` に設定** → 存在しない `kz_note` サブフォルダを探して **ビルドが失敗**

#### まとめ

| プロジェクト構成 | Root Directory の値 |
|------------------|----------------------|
| package.json がリポジトリのルート直下にある（あなたの構成） | **空欄** |
| リポジトリのルートに `kz_note/` フォルダがあり、その中に package.json がある | `kz_note` |

---

## Step 2: 環境変数の設定

Vercel の **Settings** → **Environment Variables** で以下を追加:

| 変数名 | 必須 | 取得元 | 備考 |
|--------|------|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase > Project Settings > API | 例: `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase > Project Settings > API | anon (public) キー |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase > Project Settings > API | **service_role** キー（Reveal で表示） |
| `ANTHROPIC_API_KEY` | ✅ | [Anthropic Console](https://console.anthropic.com/) | AI要約・図解生成用 |
| `OPENAI_API_KEY` | ✅ | [OpenAI Platform](https://platform.openai.com/api-keys) | 埋め込み・検索用 |
| `CRON_SECRET` | ✅ | 自作 | 16文字以上のランダム文字列 |

### CRON_SECRET の生成

```bash
openssl rand -hex 16
```

出力された文字列をそのまま `CRON_SECRET` の値に設定。

---

## Step 3: デプロイ実行

1. 環境変数をすべて設定後、**Deploy** をクリック
2. または GitHub 連携済みなら `git push` で自動デプロイ

---

## Step 4: 初回トピック取得（手動実行）

Cron は毎日 UTC 21:00（JST 06:00）に自動実行されますが、初回は手動でトピックを取得できます。

```bash
curl -X GET "https://あなたのドメイン.vercel.app/api/cron/fetch-topics" \
  -H "Authorization: Bearer あなたのCRON_SECRET"
```

成功時は `{"success":true,"inserted":N,...}` が返ります。

---

## Step 5: 動作確認

1. **アプリ**: `https://あなたのドメイン.vercel.app` にアクセス
2. **ログイン**: Supabase Auth でログイン
3. **今日のAIトピック**: ホーム画面の「✦ 今日のAIトピック」セクションにトピックが表示されるか確認
4. **保存テスト**: トピックの「📥 メモとして保存」をクリックし、ノートが作成されるか確認

---

## トラブルシューティング

### Vercel デプロイが失敗する（Failed to deploy）

1. **Vercel のビルドログを確認**
   - Vercel ダッシュボード → 対象プロジェクト → **Deployments**
   - 失敗したデプロイをクリック → **Building** のログを展開
   - エラーメッセージの内容を確認

2. **Root Directory の確認**
   - このプロジェクトでは package.json がリポジトリのルート直下にあります
   - **Root Directory は空欄** にしてください。`kz_note` が入っていると失敗します
   - Settings → Build and Deployment → Root Directory を空にして Save → 再デプロイ

3. **環境変数の確認**
   - 必須の環境変数がすべて設定されているか確認
   - 特に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` はビルド時に必要

4. **ローカルでビルド確認**
   ```bash
   cd kz_note
   npm run build
   ```
   - ローカルで成功するなら、上記 1〜3 を再確認

### トピックが表示されない

- 初回は手動で `/api/cron/fetch-topics` を実行
- Supabase の `daily_topics` テーブルにデータが入っているか確認

### Cron が動かない

- Vercel の **Cron Jobs** タブで実行履歴を確認
- `CRON_SECRET` が正しく設定されているか確認
- Vercel Hobby プランは 1 日 1 回の Cron 制限あり

### 保存時にエラー

- `SUPABASE_SERVICE_ROLE_KEY` が設定されているか確認
- Supabase の `daily_topics` に `embedding` カラムがあるか確認（マイグレーション適用済みか）

---

## 環境変数一覧（まとめ）

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
CRON_SECRET=
```
