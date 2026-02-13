# Google 認証の有効化

## 方法 1: ダッシュボードで設定（推奨）

1. [Supabase ダッシュボード](https://supabase.com/dashboard) にログイン
2. **kz-code app** プロジェクトを開く
3. **Authentication** → **Providers** → **Google**
4. **Enable** をオンにする
5. Google Cloud Console で取得した **Client ID** と **Client Secret** を入力
6. **Save** をクリック

## 方法 2: スクリプトで設定

### 必要なもの

1. **Supabase Personal Access Token**
   - https://supabase.com/dashboard/account/tokens でトークンを生成

2. **Google OAuth クライアント ID**
   - [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
   - 認証情報 → OAuth 2.0 クライアント ID を作成
   - 承認済みのリダイレクト URI: `https://pvxjcuncdrvpusymyzhh.supabase.co/auth/v1/callback`

### 実行

```bash
SUPABASE_ACCESS_TOKEN=sbp_xxxxx \
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com \
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx \
npm run enable-google-auth
```
