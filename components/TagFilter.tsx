"use client";

import Link from "next/link";

type Tag = { id: string; name: string; color: string | null };

export function TagFilter({ tags, currentTag }: { tags: Tag[]; currentTag: string | null }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Link
        href="/"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition ${
          !currentTag
            ? "bg-[var(--accent-glow)] text-[var(--accent)]"
            : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        }`}
      >
        すべて
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={currentTag === tag.name ? "/" : `/?tag=${encodeURIComponent(tag.name)}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition ${
            currentTag === tag.name
              ? "bg-[var(--accent-glow)] text-[var(--accent)]"
              : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          }`}
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
