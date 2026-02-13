"use client";

import type { DailyTopic } from "@/types/database";

type TopicWithActions = DailyTopic & {
  user_actions: string[];
  relevance_score?: number;
};

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  hackernews: { label: "HN", color: "#ff6600" },
  devto: { label: "DEV", color: "#3b49df" },
  arxiv: { label: "arXiv", color: "#b31b1b" },
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "数分前";
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(diff / 86400000);
  if (days === 1) return "昨日";
  return `${days}日前`;
}

export function TopicCard({
  topic,
  onSave,
  onSkip,
  saving = false,
}: {
  topic: TopicWithActions;
  onSave?: (topicId: string) => void;
  onSkip?: (topicId: string) => void;
  saving?: boolean;
}) {
  const source = SOURCE_LABELS[topic.source] ?? {
    label: topic.source,
    color: "var(--accent)",
  };
  const isSaved = topic.user_actions.includes("saved");
  const isSkipped = topic.user_actions.includes("skipped");

  if (isSkipped) return null;

  return (
    <article className="px-4 py-3 border-b border-[var(--border)] hover:bg-[rgba(26,32,48,0.5)] transition animate-[fadeIn_0.3s_ease]">
      <div className="flex items-start gap-3">
        {/* ソースバッジ */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
          style={{ background: `${source.color}20`, color: source.color }}
        >
          {source.label}
        </div>

        <div className="flex-1 min-w-0">
          {/* ヘッダー */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[11px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${source.color}15`, color: source.color }}
            >
              {source.label}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {formatTime(topic.fetched_at)}
            </span>
            {topic.score > 0 && (
              <span className="text-[11px] text-[var(--text-muted)]">
                ▲ {topic.score}
              </span>
            )}
            {topic.relevance_score != null && topic.relevance_score > 0.1 && (
              <span className="text-[11px] text-[var(--accent-3)] font-medium">
                {Math.round(topic.relevance_score * 100)}% 関連
              </span>
            )}
          </div>

          {/* タイトル */}
          <a
            href={topic.source_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[15px] font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition leading-snug mb-1"
          >
            {topic.title}
          </a>

          {/* 説明 */}
          {topic.description && (
            <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 mb-2 leading-relaxed">
              {topic.description}
            </p>
          )}

          {/* タグ */}
          {topic.tags && topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {topic.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-glow)] text-[var(--accent)] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* アクション */}
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => onSave?.(topic.id)}
              disabled={isSaved || saving}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] transition ${
                isSaved
                  ? "text-[var(--accent-3)] bg-[rgba(52,211,153,0.08)]"
                  : "text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] disabled:opacity-50"
              }`}
            >
              {saving ? "保存中..." : isSaved ? "✓ 保存済み" : "📥 メモとして保存"}
            </button>
            <a
              href={topic.source_url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] transition"
            >
              ↗ 元記事を読む
            </a>
            <button
              onClick={() => onSkip?.(topic.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition"
            >
              ✕ 非表示
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
