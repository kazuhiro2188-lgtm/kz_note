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
    <form onSubmit={handleSubmit} className="flex gap-3.5">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4f9cf9] to-[#a78bfa] flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 font-display">
        +
      </div>
      <div className="flex-1 min-w-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今日学んだことを書いてみよう... Markdown対応"
          rows={2}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-xl px-4 py-3.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none outline-none transition focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)] leading-relaxed"
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-2.5 px-0.5">
          <div className="flex gap-1">
            <button type="button" className="w-8 h-8 rounded-lg bg-transparent border-none text-[var(--text-secondary)] cursor-pointer flex items-center justify-center text-sm hover:bg-[var(--bg-hover)] hover:text-[var(--accent)] transition" title="画像">
              🖼️
            </button>
            <button type="button" className="w-8 h-8 rounded-lg bg-transparent border-none text-[var(--text-secondary)] cursor-pointer flex items-center justify-center text-sm hover:bg-[var(--bg-hover)] hover:text-[var(--accent)] transition" title="タグ">
              🏷️
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold bg-[var(--accent)] text-white shadow-[0_0_20px_rgba(79,156,249,0.3)] hover:bg-[#6aabfb] hover:shadow-[0_0_28px_rgba(79,156,249,0.45)] hover:-translate-y-px transition disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_0_20px_rgba(79,156,249,0.3)]"
          >
            {loading ? "投稿中..." : "投稿"}
          </button>
        </div>
        <div className="mt-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="# タグを追加 (例: #TypeScript #React)"
            className="w-full bg-transparent border-none outline-none text-[var(--text-secondary)] text-[13px] py-1.5 font-sans"
            disabled={loading}
          />
        </div>
      </div>
    </form>
  );
}
