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
  const [refreshing, setRefreshing] = useState(false);

  const fetchTopics = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/topics/daily");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "トピックの取得に失敗しました");
      }
      setTopics(data.topics ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "トピックの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/topics/refresh", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchTopics();
      } else {
        setError(data.error ?? "取得に失敗しました");
      }
    } catch {
      setError("取得に失敗しました");
    } finally {
      setRefreshing(false);
    }
  };

  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSave = async (topicId: string) => {
    setSavingId(topicId);
    try {
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
      <div className="px-4 py-8 text-center">
        <div className="inline-block w-6 h-6 border-2 border-[var(--border-light)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)] pl-5 border-l-2 border-l-[var(--accent)] bg-[var(--accent-glow)]/25">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent)]"></span>
          </span>
          <span className="text-[15px] font-bold font-display text-[var(--text-primary)] tracking-tight">
            今日のAIトピック
          </span>
          {visibleTopics.length > 0 && (
            <span className="text-[12px] text-[var(--text-muted)]">
              {visibleTopics.length}件
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {visibleTopics.length === 0 && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-[12px] px-3 py-1.5 rounded-lg bg-[var(--accent-glow)] text-[var(--accent)] font-medium hover:bg-[var(--accent)] hover:text-white transition disabled:opacity-50"
            >
              {refreshing ? "取得中..." : "トピックを取得"}
            </button>
          )}
          {visibleTopics.length > 0 && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] transition px-2 py-1 rounded-md hover:bg-[var(--accent-glow)]"
            >
              {collapsed ? "展開" : "折りたたむ"}
            </button>
          )}
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-[13px] text-[var(--accent-warn)] bg-[var(--accent-warn)]/10 border border-[var(--accent-warn)]/20 rounded-lg mx-4 mb-3">
          <span>{error}</span>
          <button
            onClick={() => fetchTopics()}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-[var(--accent-warn)]/20 text-[var(--accent-warn)] font-medium hover:bg-[var(--accent-warn)]/30 transition text-[12px]"
          >
            再試行
          </button>
        </div>
      )}

      {/* 空状態 */}
      {!error && visibleTopics.length === 0 && (
        <div className="px-4 py-6 text-center">
          <p className="text-[13px] text-[var(--text-muted)] mb-3">
            トピックがまだありません。
            <br />
            毎日自動で更新されます。初回は「トピックを取得」をクリックしてください。
          </p>
        </div>
      )}

      {/* トピック一覧 */}
      {!collapsed && visibleTopics.length > 0 && (
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
