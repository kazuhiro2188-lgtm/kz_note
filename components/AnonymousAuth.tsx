"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AnonymousAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const { error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) {
          setError("Supabase の認証情報を確認してください。ダッシュボードで「Anonymous」認証を有効にしてください。");
          setReady(true);
          return;
        }
      }

      setReady(true);
      router.refresh();
    };

    init();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <p className="max-w-md text-center text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return <>{children}</>;
}
