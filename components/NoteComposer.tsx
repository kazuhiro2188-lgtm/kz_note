"use client";

import { createNote } from "@/app/actions/notes";
import { useState } from "react";

type Tag = { id: string; name: string; color: string | null };

export function NoteComposer({ userId, tags }: { userId: string; tags: Tag[] }) {
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const tagNames = tagInput
      .split(/[\s,#]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const result = await createNote({ userId, content: content.trim(), tagNames });
    setContent("");
    setTagInput("");
    setLoading(false);
    if (result?.noteId) {
      fetch("/api/ai/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: result.noteId }),
      }).catch(() => {});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今日学んだことは？"
        rows={2}
        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none outline-none transition focus:border-[var(--accent)] leading-relaxed"
        disabled={loading}
      />
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="# タグを追加"
          className="flex-1 bg-transparent border-none outline-none text-[var(--accent-3)] placeholder:text-[var(--accent-3)] text-[13px] py-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition disabled:opacity-50 shrink-0"
        >
          {loading ? "投稿中..." : "投稿"}
        </button>
      </div>
    </form>
  );
}
