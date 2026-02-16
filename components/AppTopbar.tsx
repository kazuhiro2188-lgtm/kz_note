"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { SemanticSearchWidget } from "./SemanticSearchWidget";
import type { User } from "@supabase/supabase-js";

export function AppTopbar({ user }: { user: User | null }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "ホーム", icon: "home" },
    { href: "/chat", label: "チャット", icon: "chat" },
  ];

  return (
    <header className="sticky top-0 z-20 bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border)]">
      {/* 上段: ロゴ + ナビ + 検索 + ユーザー - 大画面で幅を有効活用 */}
      <div className="w-full max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          {/* ロゴ */}
          <Link href="/" className="shrink-0 ml-2">
            <Image
              src="/logo-sidebar.png"
              alt="kz_note"
              width={100}
              height={100}
              className="w-[100px] h-[100px] object-contain"
            />
          </Link>

          {/* 検索 - ページ中央に配置 */}
          <div className="flex-1 flex justify-center hidden md:flex">
            <div className="w-full max-w-md xl:max-w-lg 2xl:max-w-xl">
              <SemanticSearchWidget compact />
            </div>
          </div>

          {/* ナビ + ログイン（ログイン手前に配置、サイズ統一） */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium transition ${
                      isActive
                        ? "bg-[var(--accent-glow)] text-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <NavIcon name={item.icon} active={isActive} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            {user?.is_anonymous || !user ? (
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname || "/")}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium text-[var(--accent)] hover:bg-[var(--accent-glow)] transition"
              >
                <LoginIcon />
                <span className="hidden sm:inline">ログイン</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b9cf6] to-[#a78bfa] flex items-center justify-center text-xs font-bold">
                  {user.email?.[0]?.toUpperCase() ?? "?"}
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                  >
                    ログアウト
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function LoginIcon() {
  const size = 18;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function NavIcon({ name, active }: { name: string; active?: boolean }) {
  const size = 18;
  if (name === "home") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 2}
        className="shrink-0"
      >
        <path d="M12 2L2 10v12h8v-8h4v8h8V10L12 2z" />
      </svg>
    );
  }
  if (name === "chat") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="shrink-0"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return null;
}
