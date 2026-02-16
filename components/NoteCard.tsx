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
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${h}:${min}`;
}

const GRADIENT_PALETTES = [
  { from: "#4f9cf9", to: "#a78bfa" }, // 青→紫
  { from: "#34d399", to: "#22d3ee" }, // 緑→シアン
  { from: "#f472b6", to: "#fb923c" }, // ピンク→オレンジ
  { from: "#fbbf24", to: "#f97316" }, // 黄→オレンジ
  { from: "#a78bfa", to: "#f472b6" }, // 紫→ピンク
  { from: "#22d3ee", to: "#3b82f6" }, // シアン→青
];

function getGradientColors(title: string): { from: string; to: string } {
  let hash = 0;
  const str = title || "default";
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
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

  const gradient = getGradientColors(note.title || note.content);

  return (
    <article
      className="group/card py-4 hover:bg-[rgba(26,32,48,0.5)] transition flex animate-[fadeIn_0.3s_ease] border-l-[3px] pl-4 md:pl-5 pr-4 md:pr-6"
      style={{ borderLeftColor: gradient.from }}
    >
      {/* タイムラインドット + 縦ライン */}
      <div className="flex flex-col items-center shrink-0 mr-3.5 pt-1.5">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_6px_rgba(0,0,0,0.3)]"
          style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
        />
        <div className="timeline-line w-px flex-1 mt-1.5 bg-[var(--border)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-display text-[15px] font-bold text-[var(--text-primary)] flex-1 min-w-0 truncate">
            {note.title || "無題"}
          </h2>
          <span className="text-[11px] text-[var(--text-muted)] shrink-0 inline-flex items-center gap-1">
            <ClockIcon />
            {formatTime(note.created_at)}
          </span>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {note.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/?tag=${encodeURIComponent(tag.name)}`}
                className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--tag-bg)] border border-[var(--tag-border)] font-medium inline-flex items-center gap-0.5 text-[var(--accent)]"
                style={tag.color ? { background: `${tag.color}14`, borderColor: `${tag.color}40` } : undefined}
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
            <ChatIcon />
            チャットで深掘り
          </Link>
          <button
            onClick={handleGenerateFlowchart}
            disabled={flowchartLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] transition disabled:opacity-50"
          >
            <FlowchartIcon />
            {flowchartLoading ? "生成中..." : flowchart ? "図解を再生成" : "図解を開く"}
          </button>
          <button
            onClick={handleGenerateMindmap}
            disabled={mindmapLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] transition disabled:opacity-50"
          >
            <MindmapIcon />
            {mindmapLoading ? "生成中..." : mindmap ? "マインドマップを再生成" : "AIマインドマップ"}
          </button>
          <button
            onClick={handleGenerateEmbedding}
            disabled={embeddingLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--accent-3)] hover:bg-[rgba(52,211,153,0.08)] transition disabled:opacity-50"
            title="検索・チャット用に登録"
          >
            <SearchRegisterIcon />
            {embeddingLoading ? "登録中..." : "検索に登録"}
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--accent-3)] hover:bg-[rgba(52,211,153,0.08)] transition"
          >
            <CopyIcon />
            {copied ? "コピー済み" : "コピー"}
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] transition"
          >
            <EditIcon />
            編集
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
          >
            <DeleteIcon />
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

const iconSize = 12;

function ClockIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0 opacity-70">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function FlowchartIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}

function MindmapIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function SearchRegisterIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      <path d="M11 7v6M8 10h6" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
