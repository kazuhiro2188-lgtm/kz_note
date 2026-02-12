"use client";

import Link from "next/link";

type Tag = { id: string; name: string; color: string | null };

export function TagFilter({ tags, currentTag }: { tags: Tag[]; currentTag: string | null }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className={`rounded-full px-3 py-1.5 text-sm transition ${
          !currentTag
            ? "bg-zinc-700 text-white"
            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
        }`}
      >
        すべて
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={currentTag === tag.name ? "/" : `/?tag=${encodeURIComponent(tag.name)}`}
          className={`rounded-full px-3 py-1.5 text-sm transition ${
            currentTag === tag.name
              ? "bg-zinc-700 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
          }`}
          style={tag.color && currentTag !== tag.name ? { borderColor: tag.color } : undefined}
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
