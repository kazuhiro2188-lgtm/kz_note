import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { generateRagResponse } from "@/lib/ai/rag-chat";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
  const { message, sessionId, noteId } = await request.json();
  if (!message || typeof message !== "string" || !sessionId) {
    return NextResponse.json(
      { error: "message and sessionId required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // セッション確認
  const { data: session } = await supabase
    .from("kz_chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // ユーザーメッセージを保存
  await supabase.from("kz_chat_messages").insert({
    session_id: sessionId,
    role: "user",
    content: message,
  });

  // RAG: コンテキストを構築
  let context = "";

  // noteId 指定時: そのメモを優先コンテキストに
  if (noteId && typeof noteId === "string") {
    const { data: note } = await supabase
      .from("notes")
      .select("title, content")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (note && (note.content || note.title)) {
      const noteContext = note.title
        ? `【タイトル】${note.title}\n\n【本文】\n${note.content || ""}`
        : String(note.content || "");
      context = noteContext.trim();
    }
  }

  // セマンティック検索で関連メモを追加（noteId 指定時は補足として）
  if (process.env.OPENAI_API_KEY) {
    const embedding = await generateEmbedding(message);
    if (embedding) {
      const { data: matches, error: rpcError } = await supabase.rpc("match_note_embeddings", {
        query_embedding: embedding,
        match_user_id: user.id,
        match_threshold: 0.25,
        match_count: noteId ? 3 : 5,
      });

      if (rpcError) {
        console.error("[api/ai/chat] match_note_embeddings error:", rpcError);
      }

      if (matches && matches.length > 0) {
        const searchContext = matches
          .map((m: { content: string }) => m.content)
          .join("\n\n---\n\n");
        if (searchContext) {
          context = context
            ? `${context}\n\n---\n\n【その他の関連メモ】\n${searchContext}`
            : searchContext;
        }
      }
    }
  }

  // チャット履歴を取得
  const { data: history } = await supabase
    .from("kz_chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const chatHistory = (history ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const assistantMessage = await generateRagResponse(
    message,
    context,
    chatHistory
  );

  await supabase.from("kz_chat_messages").insert({
    session_id: sessionId,
    role: "assistant",
    content: assistantMessage,
  });

  return NextResponse.json({ message: assistantMessage });
  } catch (err) {
    console.error("[api/ai/chat] Error:", err);
    let message = err instanceof Error ? err.message : "Internal server error";
    if (message.includes("invalid x-api-key") || message.includes("authentication_error")) {
      message = "AI API の認証に失敗しました。.env.local の ANTHROPIC_API_KEY を確認してください。";
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
