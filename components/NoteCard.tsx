"use client";

import { useState } from "react";
import { updateNote, deleteNote } from "@/app/actions/notes";
import Link from "next/link";
import { MermaidDiagram } from "./MermaidDiagram";

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

function formatTime(created: string) {
  const d = new Date(created);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return "数分前";
  if (hours < 24) return `${hours}時間前`;
  if (days === 1) return "昨日";
  if (days < 7) return `${days}日前`;
  return d.toLocaleDateString("ja-JP");
}

export function NoteCard({ note, userId }: { note: NoteWithTags; userId: string }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [flowchart, setFlowchart] = useState<string | null>(note.flowchart);
  const [flowchartLoading, setFlowchartLoading] = useState(false);
  const [mindmap, setMindmap] = useState<string | null>(note.mindmap);
  const [mindmapLoading, setMindmapLoading] = useState(false);
  const [embeddingLoading, setEmbeddingLoading] = useState(false);

  const handleGenerateEmbedding = async () => {
    setEmbeddingLoading(true);
    try {
      await fetch("/api/ai/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id }),
      });
    } finally {
      setEmbeddingLoading(false);
    }
  };

  const handleGenerateFlowchart = async () => {
    setFlowchartLoading(true);
    try {
      const res = await fetch("/api/ai/flowchart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id }),
      });
      const data = await res.json();
      if (data.mermaid) setFlowchart(data.mermaid);
    } finally {
      setFlowchartLoading(false);
    }
  };

  const handleGenerateMindmap = async () => {
    setMindmapLoading(true);
    try {
      const res = await fetch("/api/ai/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id }),
      });
      const data = await res.json();
      if (data.mermaid) setMindmap(data.mermaid);
    } finally {
      setMindmapLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    await updateNote({ noteId: note.id, title: editTitle, content: editContent });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("このメモを削除しますか？")) return;
    setIsDeleting(true);
    await deleteNote(note.id);
  };

  return (
    <article className="px-4 md:px-6 py-4 border-b border-[var(--border)] hover:bg-[rgba(26,32,48,0.5)] transition flex gap-3.5 animate-[fadeIn_0.3s_ease]">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4f9cf9] to-[#a78bfa] flex items-center justify-center text-[13px] font-bold shrink-0 mt-0.5 font-display">
        {note.title?.[0]?.toUpperCase() ?? note.content?.[0] ?? "n"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-display text-[15px] font-bold text-[var(--text-primary)] flex-1 min-w-0 truncate">
            {note.title || "無題"}
          </h2>
          <span className="text-[11px] text-[var(--text-muted)] shrink-0">{formatTime(note.created_at)}</span>
        </div>
        <p className="text-[13.5px] leading-[1.65] text-[var(--text-secondary)] line-clamp-3 mb-2.5">
          {note.content}
        </p>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {note.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/?tag=${encodeURIComponent(tag.name)}`}
                className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--tag-bg)] border border-[var(--tag-border)] text-[var(--accent)] font-medium"
                style={tag.color ? { background: `${tag.color}14`, borderColor: `${tag.color}40`, color: tag.color } : undefined}
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {note.summary && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-light)] border-l-2 border-l-[var(--accent)] rounded-r-lg py-2.5 px-3.5 mb-2.5">
            <div className="text-[10px] font-bold tracking-wider uppercase text-[var(--accent)] font-display mb-1 flex items-center gap-1">
              ✦ AI要約
            </div>
            <div className="text-[12px] text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">{note.summary}</div>
          </div>
        )}

        {flowchart && (
          <div className="mb-2.5">
            <MermaidDiagram code={flowchart} />
          </div>
        )}
        {mindmap && (
          <div className="mb-2.5">
            <MermaidDiagram code={mindmap} />
          </div>
        )}

        <div className="flex gap-0.5 mt-1.5 flex-wrap">
          <Link
            href={`/chat?note=${note.id}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] transition"
          >
            💬 チャットで深掘り
          </Link>
          <button
            onClick={handleGenerateFlowchart}
            disabled={flowchartLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] transition disabled:opacity-50"
          >
            {flowchartLoading ? "生成中..." : flowchart ? "🔀 図解を再生成" : "🔀 図解を開く"}
          </button>
          <button
            onClick={handleGenerateMindmap}
            disabled={mindmapLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] transition disabled:opacity-50"
          >
            {mindmapLoading ? "生成中..." : mindmap ? "🧩 マインドマップを再生成" : "🧩 AIマインドマップ"}
          </button>
          <button
            onClick={handleGenerateEmbedding}
            disabled={embeddingLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--accent-3)] hover:bg-[rgba(52,211,153,0.08)] transition disabled:opacity-50"
            title="検索・チャット用に登録"
          >
            {embeddingLoading ? "登録中..." : "⎘ 検索に登録"}
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--accent-3)] hover:bg-[rgba(52,211,153,0.08)] transition"
          >
            {copied ? "コピー済み" : "⎘ コピー"}
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] transition"
          >
            編集
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
          >
            削除
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[18px] w-full max-w-[560px] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-base font-bold">編集</span>
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] flex items-center justify-center hover:bg-[var(--border-light)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[10px] px-4 py-3 text-[var(--text-primary)] mb-2"
              placeholder="タイトル"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[10px] px-4 py-3 text-[var(--text-primary)] mb-4"
              placeholder="本文"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-semibold"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
