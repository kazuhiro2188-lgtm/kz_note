"use client";

import { useState } from "react";
import Link from "next/link";

export function SemanticSearchWidget() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ note_id: string; content: string; similarity: number }[]>([]);
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
    <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden mb-3">
      <div className="p-3">
        <h3 className="text-[15px] font-bold mb-2">意味検索</h3>
        <div className="flex gap-1.5">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="メモを検索..."
            className="flex-1 bg-[var(--bg-primary)] rounded-full px-3 py-2 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-3 py-2 rounded-full bg-[var(--accent)] text-white text-[13px] font-semibold hover:bg-[#6aabfb] disabled:opacity-50 transition"
          >
            検索
          </button>
        </div>
        {searched && (
          <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-[13px] text-[var(--text-muted)]">該当なし</p>
            ) : (
              results.slice(0, 5).map((r, i) => (
                <Link
                  key={i}
                  href={`/?note=${r.note_id}`}
                  className="block p-2.5 rounded-lg bg-[var(--bg-primary)] hover:bg-[var(--bg-hover)] transition"
                >
                  <p className="text-[13px] text-[var(--text-primary)] line-clamp-2">
                    {r.content}
                  </p>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {(r.similarity * 100).toFixed(0)}% 一致
                  </span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
