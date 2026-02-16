"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);

  const rawRedirect = searchParams.get("redirect") || searchParams.get("next") || "/";
  const redirectTo = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.is_anonymous) {
        router.replace(redirectTo);
        return;
      }
      setChecking(false);
    };
    check();
  }, [router, redirectTo]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(searchParams.get("error") === "auth" ? "認証に失敗しました。もう一度お試しください。" : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

      if (isSignUp) {
      const callbackUrl = `${location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callbackUrl },
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("確認メールを送信しました。メール内のリンクをクリックしてください。");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-secondary)]">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="kz_note"
            width={150}
            height={100}
            className="h-[100px] w-[150px]"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)]">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-[var(--border-light)] bg-[var(--bg-secondary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)]">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-[var(--border-light)] bg-[var(--bg-secondary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="••••••••"
            />
          </div>
          {message && (
            <p className={`text-sm ${message.includes("確認") ? "text-[var(--accent-3)]" : "text-red-400"}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 font-medium text-white shadow-[0_0_20px_var(--accent-glow)] transition hover:bg-[#6aabfb] disabled:opacity-50"
          >
            {loading ? "処理中..." : isSignUp ? "アカウント作成" : "ログイン"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-secondary)]">
          {isSignUp ? (
            <>
              すでにアカウントをお持ちですか？{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="font-medium text-[var(--accent)] hover:text-[#6aabfb]"
              >
                ログイン
              </button>
            </>
          ) : (
            <>
              アカウントをお持ちでないですか？{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="font-medium text-[var(--accent)] hover:text-[#6aabfb]"
              >
                新規登録
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-secondary)]">読み込み中...</div>}>
      <LoginForm />
    </Suspense>
  );
}
