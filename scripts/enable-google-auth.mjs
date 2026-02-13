/**
 * Supabase で Google 認証を有効化するスクリプト
 *
 * 使い方:
 * 1. Supabase の Personal Access Token を取得
 *    https://supabase.com/dashboard/account/tokens
 *
 * 2. Google Cloud Console で OAuth クライアント ID を作成
 *    - 承認済みのリダイレクト URI: https://pvxjcuncdrvpusymyzhh.supabase.co/auth/v1/callback
 *
 * 3. 環境変数を設定して実行:
 *    SUPABASE_ACCESS_TOKEN=sbp_xxx \
 *    GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com \
 *    GOOGLE_CLIENT_SECRET=GOCSPX-xxx \
 *    node scripts/enable-google-auth.mjs
 */

const PROJECT_REF = "pvxjcuncdrvpusymyzhh";

async function enableGoogleAuth() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!token) {
    console.error("❌ SUPABASE_ACCESS_TOKEN が設定されていません");
    console.error("   https://supabase.com/dashboard/account/tokens でトークンを取得してください");
    process.exit(1);
  }

  if (!clientId || !clientSecret) {
    console.error("❌ GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET が設定されていません");
    console.error("   Google Cloud Console で OAuth クライアント ID を作成してください");
    process.exit(1);
  }

  const body = {
    external_google_enabled: true,
    external_google_client_id: clientId,
    external_google_secret: clientSecret,
  };

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`❌ エラー (${res.status}):`, text);
    process.exit(1);
  }

  console.log("✅ Google 認証を有効化しました");
  console.log("   リダイレクト URI: https://pvxjcuncdrvpusymyzhh.supabase.co/auth/v1/callback");
}

enableGoogleAuth();
