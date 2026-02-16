"use client";

import { useState } from "react";
import Link from "next/link";

export function SemanticSearchWidget({ compact }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ note_id: string; content: string; similarity: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "検索に失敗しました");
      }
      setResults(data.results ?? []);
    } catch (e) {
      setResults([]);
      setError(e instanceof Error ? e.message : "検索に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="relative">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="メモを検索... (タグ検索)"
            className="flex-1 bg-[var(--bg-secondary)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none transition"
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50 transition shrink-0"
          >
            {loading ? "..." : "検索"}
          </button>
        </div>
        {error && (
          <p className="absolute top-full left-0 right-0 mt-1 px-3 py-2 text-[12px] text-[var(--accent-warn)] bg-[var(--accent-warn)]/10 rounded-lg z-50">
            {error}
          </p>
        )}
        {searched && !error && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
            {results.slice(0, 5).map((r, i) => (
              <Link
                key={i}
                href={`/?note=${r.note_id}`}
                onClick={() => setSearched(false)}
                className="block px-4 py-3 hover:bg-[var(--bg-hover)] transition border-b border-[var(--border)] last:border-b-0"
              >
                <p className="text-[13px] text-[var(--text-primary)] line-clamp-1">{r.content}</p>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {(r.similarity * 100).toFixed(0)}% 一致
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
        意味検索
      </h3>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="メモを検索..."
          className="flex-1 bg-[var(--bg-secondary)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border)] focus:border-[var(--accent)] focus:outline-none transition"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition shrink-0"
        >
          検索
        </button>
      </div>
      {error && (
        <p className="mt-2 text-[12px] text-[var(--accent-warn)]">{error}</p>
      )}
      {searched && !error && (
        <div className="mt-2 space-y-1 max-h-36 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-[12px] text-[var(--text-muted)] py-2">該当なし</p>
          ) : (
            results.slice(0, 5).map((r, i) => (
              <Link
                key={i}
                href={`/?note=${r.note_id}`}
                className="block p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition"
              >
                <p className="text-[12px] text-[var(--text-primary)] line-clamp-2">{r.content}</p>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {(r.similarity * 100).toFixed(0)}% 一致
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
