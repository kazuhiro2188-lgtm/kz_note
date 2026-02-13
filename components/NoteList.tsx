"use client";

import { NoteCard } from "./NoteCard";

type NoteWithTags = {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  flowchart: string | null;
  mindmap: string | null;
  created_at: string;
  tags: { id: string; name: string; color: string | null }[];
};

export function NoteList({
  notes,
  userId,
  emptyMessage = "まだメモがありません。上のフォームから投稿してみましょう。",
}: {
  notes: NoteWithTags[];
  userId: string;
  emptyMessage?: string;
}) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-16 px-6 text-[var(--text-muted)] text-[13px]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} userId={userId} />
      ))}
    </div>
  );
}
