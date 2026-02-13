"use client";

import { useState, useEffect, useCallback } from "react";
import { TopicCard } from "./TopicCard";
import type { DailyTopic } from "@/types/database";

type TopicWithActions = DailyTopic & {
  user_actions: string[];
  relevance_score?: number;
};

export function TopicFeed({ userId }: { userId: string }) {
  const [topics, setTopics] = useState<TopicWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const fetchTopics = useCallback(async () => {
    try {
      const res = await fetch("/api/topics/daily");
      if (!res.ok) throw new Error("Failed to fetch topics");
      const data = await res.json();
      setTopics(data.topics ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSave = async (topicId: string) => {
    setSavingId(topicId);
    try {
      // トピックをノートとして保存（AI要約 + エンベディング自動生成）
      await fetch("/api/topics/save-as-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });

      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? { ...t, user_actions: [...t.user_actions, "saved"] }
            : t
        )
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleSkip = async (topicId: string) => {
    await fetch("/api/topics/interaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, action: "skipped", userId }),
    });

    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId
          ? { ...t, user_actions: [...t.user_actions, "skipped"] }
          : t
      )
    );
  };

  const visibleTopics = topics.filter(
    (t) => !t.user_actions.includes("skipped")
  );

  if (loading) {
    return (
      <div className="px-4 py-6 text-center">
        <div className="inline-block w-5 h-5 border-2 border-[var(--border-light)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || visibleTopics.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-[var(--border)]">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-[var(--text-primary)]">
            ✦ 今日のAIトピック
          </span>
          <span className="text-[12px] text-[var(--text-muted)]">
            {visibleTopics.length}件
          </span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] transition px-2 py-1 rounded-md hover:bg-[var(--accent-glow)]"
        >
          {collapsed ? "展開" : "折りたたむ"}
        </button>
      </div>

      {/* トピック一覧 */}
      {!collapsed && (
        <div>
          {(showAll ? visibleTopics : visibleTopics.slice(0, 5)).map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onSave={handleSave}
              onSkip={handleSkip}
              saving={savingId === topic.id}
            />
          ))}
          {!showAll && visibleTopics.length > 5 && (
            <div className="px-4 py-3 text-center">
              <button
                onClick={() => setShowAll(true)}
                className="text-[13px] text-[var(--accent)] hover:underline"
              >
                さらに {visibleTopics.length - 5} 件を表示
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
