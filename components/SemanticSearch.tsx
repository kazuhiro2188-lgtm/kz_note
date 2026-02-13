"use client";

import { useState } from "react";

type SearchResult = { note_id: string; content: string; similarity: number };

export function SemanticSearch({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] overflow-hidden ${compact ? "rounded-[10px]" : ""}`}>
      <div className={compact ? "p-2" : "p-4"}>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="メモをセマンティック検索..."
            className={`flex-1 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-[10px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none transition ${compact ? "px-3 py-2 text-sm" : "px-4 py-2.5"}`}
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className={`rounded-lg bg-[var(--accent)] text-white font-semibold transition hover:bg-[#6aabfb] disabled:opacity-50 ${compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-[13px]"}`}
          >
            {loading ? "検索中..." : "検索"}
          </button>
        </div>
        {searched && (
          <div className="mt-3 space-y-2">
            {results.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                該当するメモがありません。メモを投稿し、埋め込みを生成してください。
              </p>
            ) : (
              results.map((r, i) => (
                <a
                  key={i}
                  href={`/?note=${r.note_id}`}
                  className="block rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3 text-sm text-[var(--text-primary)] hover:border-[var(--accent)] transition"
                >
                  <p className="line-clamp-3">{r.content}</p>
                  <span className="mt-1 text-xs text-[var(--text-muted)]">
                    類似度: {(r.similarity * 100).toFixed(0)}%
                  </span>
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
