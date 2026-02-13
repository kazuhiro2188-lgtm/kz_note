"use client";

import { useSidebar } from "./SidebarContext";
import { Sidebar } from "./Sidebar";
import type { User } from "@supabase/supabase-js";

type Tag = { id: string; name: string; color: string | null };

export function AppShell({
  user,
  tags,
  children,
}: {
  user: User | null;
  tags: Tag[];
  children: React.ReactNode;
}) {
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-screen max-w-[1280px] xl:max-w-[1400px] mx-auto">
      {/* 左サイドバー - X風: デスクトップで常時表示、モバイルでオーバーレイ */}
      <div
        className={`
          fixed xl:sticky top-0 left-0 z-30 xl:z-0
          h-screen w-[280px] xl:w-[var(--sidebar-w)] shrink-0
          xl:translate-x-0
          max-xl:transition-transform max-xl:duration-200 max-xl:ease-out
          ${sidebarOpen ? "max-xl:translate-x-0" : "max-xl:-translate-x-full"}
        `}
      >
        <Sidebar user={user} tags={tags} />
      </div>

      {/* モバイル: オーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 xl:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 中央: メインコンテンツ */}
      <main className="flex-1 min-w-0 border-x border-[var(--border)] max-xl:border-x-0 flex flex-col">
        {children}
      </main>
    </div>
  )
}
