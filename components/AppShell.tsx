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

      {/* メインコンテンツ - 大画面で幅を有効活用 */}
      <div className="flex-1 w-full max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4">
        {children}
      </div>
    </div>
  );
}
