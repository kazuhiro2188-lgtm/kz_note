"use client";

import { AppTopbar } from "./AppTopbar";
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
  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <AppTopbar user={user} tags={tags} />

      {/* メインコンテンツ */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto">
        {children}
      </div>
    </div>
  );
}
