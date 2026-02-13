"use client";

import { useState, useEffect } from "react";

type TagStat = {
  tag_name: string;
  tag_color: string | null;
  note_count: number;
  has_embeddings: boolean;
};

type KnowledgeStats = {
  tagStats: TagStat[];
  totalNotes: number;
  embeddedNotes: number;
  savedTopics: number;
};

const DEFAULT_COLORS = [
  "#4f9cf9",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#fb923c",
  "#38bdf8",
  "#c084fc",
];

export function KnowledgeMap() {
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/knowledge/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-[var(--border-light)] border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!stats || stats.totalNotes === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
        <h3 className="text-[15px] font-bold mb-2">ナレッジマップ</h3>
        <p className="text-[13px] text-[var(--text-muted)]">
          ノートを作成してタグを付けると、知識分布が可視化されます。
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...stats.tagStats.map((t) => t.note_count), 1);

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-[15px] font-bold">ナレッジマップ</h3>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-2 p-4 pb-2">
        <div className="text-center">
          <div className="text-[18px] font-bold text-[var(--accent)]">
            {stats.totalNotes}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">ノート</div>
        </div>
        <div className="text-center">
          <div className="text-[18px] font-bold text-[var(--accent-3)]">
            {stats.embeddedNotes}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">検索登録済</div>
        </div>
        <div className="text-center">
          <div className="text-[18px] font-bold text-[var(--accent-2)]">
            {stats.savedTopics}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">保存トピック</div>
        </div>
      </div>

      {/* タグ分布バー */}
      {stats.tagStats.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          {stats.tagStats.slice(0, 8).map((tag, i) => {
            const color = tag.tag_color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            const widthPercent = Math.max(
              (tag.note_count / maxCount) * 100,
              8
            );
            return (
              <div key={tag.tag_name} className="flex items-center gap-2">
                <span
                  className="text-[12px] font-medium w-20 truncate shrink-0"
                  style={{ color }}
                >
                  #{tag.tag_name}
                </span>
                <div className="flex-1 h-4 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${widthPercent}%`,
                      background: `${color}60`,
                    }}
                  />
                </div>
                <span className="text-[11px] text-[var(--text-muted)] w-6 text-right shrink-0">
                  {tag.note_count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {stats.tagStats.length === 0 && (
        <div className="px-4 pb-4">
          <p className="text-[13px] text-[var(--text-muted)]">
            タグを付けてノートを整理すると、知識分布がここに表示されます。
          </p>
        </div>
      )}
    </div>
  );
}
