import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { generateRagResponse } from "@/lib/ai/rag-chat";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { message, sessionId } = await request.json();
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

  // RAG: セマンティック検索で関連メモを取得
  let context = "";
  if (process.env.OPENAI_API_KEY) {
    const embedding = await generateEmbedding(message);
    if (embedding) {
      const { data: matches } = await supabase.rpc("match_note_embeddings", {
        query_embedding: embedding,
        match_user_id: user.id,
        match_threshold: 0.25,
        match_count: 5,
      });

      if (matches && matches.length > 0) {
        context = matches
          .map((m: { content: string }) => m.content)
          .join("\n\n---\n\n");
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
}
