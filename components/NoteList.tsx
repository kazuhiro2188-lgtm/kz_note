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

export function NoteList({ notes, userId }: { notes: NoteWithTags[]; userId: string }) {
  if (notes.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 py-16 text-center text-zinc-500">
        まだメモがありません。上のフォームから投稿してみましょう。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} userId={userId} />
      ))}
    </div>
  );
}
