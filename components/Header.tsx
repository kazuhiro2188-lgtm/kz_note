"use client";

import { signOut } from "@/app/actions/auth";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export function Header({ user }: { user: User | null }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-white hover:text-zinc-300">
            kz_note
          </Link>
          <Link
            href="/chat"
            className="text-sm text-zinc-400 transition hover:text-amber-400"
          >
            チャット
          </Link>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400 truncate max-w-[120px]">
              {user.email ?? "ゲスト"}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                ログアウト
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
