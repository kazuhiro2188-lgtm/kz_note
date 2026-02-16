"use client";

import { useState, useEffect } from "react";
import { createChatSession } from "@/app/actions/chat";

type Session = { id: string; title: string; created_at: string };

/** ユーザー向けにエラーメッセージを分かりやすく変換 */
function formatChatError(raw: string): string {
  if (raw.includes("ANTHROPIC_API_KEY") || raw.includes("invalid x-api-key")) {
    return "AI API の設定に問題があります。管理者に ANTHROPIC_API_KEY の設定を確認してください。";
  }
  if (raw.includes("Unauthorized") || raw.includes("401")) {
    return "認証エラーです。再度ログインしてください。";
  }
  if (raw.includes("rate limit") || raw.includes("429")) {
    return "リクエストが多すぎます。しばらく待ってから再試行してください。";
  }
  if (raw.includes("Session not found") || raw.includes("404")) {
    return "セッションが見つかりません。新規チャットを開始してください。";
  }
  return `エラー: ${raw}`;
}

export function KnowledgeChat({
  userId,
  sessions: initialSessions,
  initialNoteId,
}: {
  userId: string;
  sessions: Session[];
  initialNoteId?: string;
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    // メモ指定時は新規チャットとして開始
    initialNoteId ? null : initialSessions[0]?.id ?? null
  );
  const [focusedNoteId, setFocusedNoteId] = useState<string | undefined>(initialNoteId);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentSessionId) {
      fetch(`/api/chat/history?sessionId=${currentSessionId}`)
        .then((r) => r.json())
        .then((d) => setMessages(d.messages ?? []))
        .catch(() => setMessages([]));
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  const handleNewChat = async () => {
    const id = await createChatSession(userId);
    setSessions((s) => [{ id, title: "新規チャット", created_at: new Date().toISOString() }, ...s]);
    setCurrentSessionId(id);
    setMessages([]);
    setFocusedNoteId(undefined);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const sessionId = currentSessionId ?? (await createChatSession(userId));
    if (!currentSessionId) {
      setSessions((s) => [
        { id: sessionId, title: "新規チャット", created_at: new Date().toISOString() },
        ...s,
      ]);
      setCurrentSessionId(sessionId);
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          ...(focusedNoteId && { noteId: focusedNoteId }),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.message) {
        setMessages((m) => [...m, { role: "assistant", content: data.message }]);
      } else {
        const rawErr = data.error || `サーバーエラー (${res.status})`;
        const userMsg = formatChatError(rawErr);
        setMessages((m) => [...m, { role: "assistant", content: userMsg }]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "ネットワークエラーです。接続を確認して再試行してください。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6">
      <aside className="w-48 shrink-0">
        <button
          onClick={handleNewChat}
          className="w-full rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          + 新規チャット
        </button>
        <ul className="mt-4 space-y-1">
          {sessions.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setCurrentSessionId(s.id)}
                className={`w-full rounded px-2 py-1.5 text-left text-sm transition ${
                  currentSessionId === s.id
                    ? "bg-[var(--accent-glow)] text-[var(--accent)] font-medium"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex h-[500px] flex-col">
          {focusedNoteId && (
            <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--accent-glow)]/50">
              <span className="text-xs text-[var(--accent)] font-medium">このメモにフォーカス中</span>
              <button
                type="button"
                onClick={() => setFocusedNoteId(undefined)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition"
              >
                解除
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                {focusedNoteId
                  ? "このメモについて質問してみましょう"
                  : "メッセージを送信して、メモの内容について質問してみましょう"}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    m.role === "user"
                      ? "bg-[var(--accent-glow)] text-[var(--text-primary)] border border-[var(--border-light)]"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-[var(--bg-secondary)] px-4 py-2 text-[var(--text-muted)]">
                  考え中...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border)] p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={focusedNoteId ? "このメモについて質問..." : "メモの内容について質問..."}
                className="flex-1 rounded-lg border border-[var(--border-light)] bg-[var(--bg-secondary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-lg bg-[var(--accent)] px-4 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                送信
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
