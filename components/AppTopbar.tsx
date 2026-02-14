"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { SemanticSearchWidget } from "./SemanticSearchWidget";
import type { User } from "@supabase/supabase-js";

type Tag = { id: string; name: string; color: string | null };

export function AppTopbar({ user, tags }: { user: User | null; tags: Tag[] }) {
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
          <Link href="/" className="shrink-0">
            <Image
              src="/logo-sidebar.png"
              alt="kz_note"
              width={100}
              height={100}
              className="w-[100px] h-[100px] object-contain"
            />
          </Link>

          {/* ナビ */}
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

          {/* 検索 - 中央 */}
          <div className="flex-1 max-w-md xl:max-w-lg 2xl:max-w-xl hidden md:block">
            <SemanticSearchWidget compact />
          </div>

          {/* タグ - 中央右 */}
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto shrink-0">
            {tags.slice(0, 5).map((tag) => (
              <Link
                key={tag.id}
                href={`/?tag=${encodeURIComponent(tag.name)}`}
                className="px-2.5 py-1 rounded-lg text-[12px] font-medium transition hover:bg-[var(--bg-hover)] whitespace-nowrap"
                style={
                  tag.color
                    ? { color: tag.color, background: `${tag.color}15` }
                    : { color: "var(--text-secondary)", background: "var(--bg-secondary)" }
                }
              >
                #{tag.name}
              </Link>
            ))}
          </div>

          {/* ユーザー */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {user?.is_anonymous || !user ? (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-[var(--accent)] hover:bg-[var(--accent-glow)] transition"
              >
                ログイン
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
