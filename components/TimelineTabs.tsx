"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function TimelineTabs({ currentTab, compact, inline }: { currentTab?: string; compact?: boolean; inline?: boolean }) {
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag");
  const tab = currentTab ?? searchParams.get("tab") ?? "all";
  const tagParam = tag ? `tag=${encodeURIComponent(tag)}` : "";

  const tabs = [
    { id: "all", label: "すべて", href: tagParam ? `/?${tagParam}` : "/" },
    { id: "drafts", label: "下書き", href: tagParam ? `/?${tagParam}&tab=drafts` : "/?tab=drafts" },
    { id: "threads", label: "スレッド", href: tagParam ? `/?${tagParam}&tab=threads` : "/?tab=threads" },
  ];

  return (
    <div className={`flex w-full ${compact ? "border-0" : "border-b border-[var(--border)]"} ${inline ? "gap-0 shrink-0 flex-1" : "gap-4"}`}>
      {tabs.map((t) => {
        const isActive = tab === t.id;
        return (
          <Link
            key={t.id}
            href={t.href}
            className={`${inline ? "flex-1 px-2 sm:px-3 py-1.5 rounded-lg text-center" : `flex-1 ${compact ? "py-2" : "py-3.5"}`} text-center text-[13px] font-semibold font-display transition ${
              isActive
                ? inline
                  ? "text-[var(--accent)] bg-[var(--accent-glow)] border-b-2 border-[var(--accent)]"
                  : "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                : `text-[var(--text-secondary)] hover:text-[var(--text-primary)] ${inline ? "hover:bg-[var(--bg-hover)]" : ""}`
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
