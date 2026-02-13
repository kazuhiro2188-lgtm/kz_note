"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { useSidebar } from "./SidebarContext";
import { SemanticSearchWidget } from "./SemanticSearchWidget";
import { KnowledgeMap } from "./KnowledgeMap";
import type { User } from "@supabase/supabase-js";

type Tag = { id: string; name: string; color: string | null };

export function Sidebar({ user, tags }: { user: User | null; tags: Tag[] }) {
  const pathname = usePathname();
  const { setSidebarOpen } = useSidebar();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const navItems = [
    { href: "/", label: "ホーム", icon: "home" },
    { href: "/chat", label: "チャット", icon: "chat" },
  ];

  return (
    <aside className="h-full flex flex-col px-3 py-2 xl:py-4 bg-[var(--bg-primary)] overflow-y-auto">
      {/* 意味検索 */}
      <div className="mb-3">
        <SemanticSearchWidget />
      </div>

      {/* タグ */}
      <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden mb-3">
        <div className="px-3 py-2">
          <h3 className="text-[15px] font-bold">タグ</h3>
        </div>
        <div className="flex flex-wrap gap-1.5 p-3 pt-0">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="px-2.5 py-1 rounded-full text-[13px] font-medium bg-[var(--bg-hover)] text-[var(--accent)] hover:bg-[var(--accent-glow)] transition"
          >
            #すべて
          </Link>
          {tags.slice(0, 10).map((tag) => (
            <Link
              key={tag.id}
              href={`/?tag=${encodeURIComponent(tag.name)}`}
              onClick={() => setSidebarOpen(false)}
              className="px-2.5 py-1 rounded-full text-[13px] font-medium transition hover:bg-[var(--bg-hover)]"
              style={
                tag.color
                  ? {
                      borderColor: `${tag.color}4d`,
                      color: tag.color,
                      background: `${tag.color}14`,
                    }
                  : {
                      background: "var(--bg-hover)",
                      color: "var(--accent)",
                    }
              }
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ナビゲーション - X風 */}
      <nav className="flex flex-col gap-0.5 mt-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-full text-[15px] font-medium transition ${
                isActive
                  ? "font-bold"
                  : "font-normal text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <NavIcon name={item.icon} active={isActive} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ナレッジマップ */}
      <div className="mt-3 mb-3">
        <KnowledgeMap />
      </div>

      {/* 新規メモボタン - XのPostボタン風 */}
      <Link
        href="/"
        onClick={() => setSidebarOpen(false)}
        className="mt-3 flex items-center justify-center w-[90%] py-2.5 rounded-full bg-[var(--accent)] text-white font-bold text-[15px] hover:bg-[#6aabfb] transition"
      >
        メモする
      </Link>

      {/* ユーザー - 下部固定 */}
      <div className="mt-auto pt-3">
        <div className="flex items-center gap-2.5 p-2.5 rounded-full hover:bg-[var(--bg-hover)] transition cursor-default">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4f9cf9] to-[#a78bfa] flex items-center justify-center text-xs font-bold shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-bold truncate">
              {user?.email?.split("@")[0] ?? "ゲスト"}
            </div>
            <div className="text-[13px] text-[var(--text-muted)] truncate">
              @{user?.email?.split("@")[0] ?? "guest"}
            </div>
          </div>
        </div>
        <div className="mt-1">
          {user?.is_anonymous ? (
          <Link
            href="/login"
            onClick={() => setSidebarOpen(false)}
            className="block px-3 py-1.5 text-[14px] text-[var(--accent)] hover:bg-[var(--accent-glow)] rounded-full"
          >
            ログイン
          </Link>
        ) : user ? (
          <form action={signOut}>
            <button
              type="submit"
              className="w-full text-left px-3 py-1.5 text-[14px] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-full"
            >
                ログアウト
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              onClick={() => setSidebarOpen(false)}
              className="block px-3 py-1.5 text-[14px] text-[var(--accent)] hover:bg-[var(--accent-glow)] rounded-full"
            >
              ログイン
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

function NavIcon({ name, active }: { name: string; active?: boolean }) {
  const size = 20;
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
