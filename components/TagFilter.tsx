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
            ? "bg-[var(--accent-glow)] text-[var(--accent-3)]"
            : "bg-[var(--bg-secondary)] text-[var(--accent-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--accent-3)]"
        }`}
      >
        タグ一覧
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={currentTag === tag.name ? "/" : `/?tag=${encodeURIComponent(tag.name)}`}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition ${
            currentTag === tag.name
              ? "bg-[var(--accent-glow)]"
              : "bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]"
          }`}
        >
          <span className="text-[var(--accent-3)]">#</span>
          <span className="text-[var(--accent-3)]">{tag.name}</span>
        </Link>
      ))}
    </div>
  );
}
