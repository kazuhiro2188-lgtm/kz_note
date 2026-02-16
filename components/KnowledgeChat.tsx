"use client";

import { useState, useEffect } from "react";
import { createChatSession } from "@/app/actions/chat";

type Session = { id: string; title: string; created_at: string };

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
        const errMsg = data.error || `サーバーエラー (${res.status})`;
        setMessages((m) => [...m, { role: "assistant", content: `エラー: ${errMsg}` }]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "送信に失敗しました。" },
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
          className="w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-amber-400"
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
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
                }`}
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50">
        <div className="flex h-[500px] flex-col">
          {focusedNoteId && (
            <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-800/30">
              <span className="text-xs text-amber-400">このメモにフォーカス中</span>
              <button
                type="button"
                onClick={() => setFocusedNoteId(undefined)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition"
              >
                解除
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-zinc-500">
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
                      ? "bg-amber-500/20 text-amber-100"
                      : "bg-zinc-800 text-zinc-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-zinc-800 px-4 py-2 text-zinc-400">
                  考え中...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800 p-4">
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
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-zinc-900 transition hover:bg-amber-400 disabled:opacity-50"
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
