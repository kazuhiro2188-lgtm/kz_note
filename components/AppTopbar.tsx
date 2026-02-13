"use client";

import Link from "next/link";
import Image from "next/image";
import { useSidebar } from "./SidebarContext";

export function AppTopbar() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-10 bg-[var(--bg-primary)]/95 backdrop-blur-xl border-b border-[var(--border)] relative">
      <div className="flex items-center justify-center min-h-[100px] px-4 py-2 relative">
        {/* モバイル: メニューボタン（左） */}
        <button
          onClick={toggleSidebar}
          className="xl:hidden absolute left-2 p-2 rounded-full hover:bg-[var(--bg-hover)] transition"
          aria-label="メニュー"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
        </button>

        {/* 中央: ロゴ */}
        <Link
          href="/"
          className="inline-flex items-center justify-center"
        >
          <Image
            src="/logo-sidebar.png"
            alt="kz_note"
            width={140}
            height={36}
            className="h-[100px] w-auto object-contain"
          />
        </Link>
      </div>
    </header>
  );
}
