"use client";

import Link from "next/link";

type Tag = { id: string; name: string; color: string | null };

export function TagFilter({ tags, currentTag }: { tags: Tag[]; currentTag: string | null }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      <Link
        href="/"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition ${
          !currentTag
            ? "bg-[var(--accent-glow)] border border-[var(--accent)] text-[var(--accent)]"
            : "border border-[var(--border-light)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)]"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        すべて
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={currentTag === tag.name ? "/" : `/?tag=${encodeURIComponent(tag.name)}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition ${
            currentTag === tag.name
              ? "bg-[var(--accent-glow)] border border-[var(--accent)] text-[var(--accent)]"
              : "border border-[var(--border-light)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)]"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
