import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateTitleAndSummary } from "@/lib/ai/claude";
import { generateEmbedding, chunkText } from "@/lib/ai/embeddings";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicId } = await request.json();
  if (!topicId) {
    return NextResponse.json({ error: "topicId required" }, { status: 400 });
  }

  // トピックを取得
  const { data: topic } = await supabase
    .from("daily_topics")
    .select("*")
    .eq("id", topicId)
    .single();

  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  // ノート本文を構成
  const content = [
    topic.title,
    "",
    topic.description || "",
    "",
    topic.source_url ? `出典: ${topic.source_url}` : "",
    "",
    `ソース: ${topic.source}`,
    topic.tags?.length
      ? `タグ: ${topic.tags.map((t: string) => `#${t}`).join(" ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  // AI でタイトル・要約を生成
  let title = `📰 ${topic.title}`;
  let summary: string | null = null;
  const aiResult = await generateTitleAndSummary(content);
  if (aiResult) {
    title = `📰 ${aiResult.title}`;
    summary = aiResult.summary;
  }

  // ノートを保存
  const { data: note, error: insertError } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title,
      content,
      content_type: "text",
      is_draft: false,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // AI要約を保存
  if (summary && note) {
    await supabase.from("note_ai_generations").insert({
      note_id: note.id,
      generation_type: "summary",
      content: summary,
    });
  }

  // タグ「discovery」を追加
  const tagName = "discovery";
  let tagId: string | null = null;
  const { data: existingTag } = await supabase
    .from("tags")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", tagName)
    .single();

  if (existingTag) {
    tagId = existingTag.id;
  } else {
    const { data: newTag } = await supabase
      .from("tags")
      .insert({ user_id: user.id, name: tagName, color: "#4f9cf9" })
      .select("id")
      .single();
    tagId = newTag?.id ?? null;
  }

  if (tagId && note) {
    await supabase
      .from("note_tags")
      .upsert(
        { note_id: note.id, tag_id: tagId },
        { onConflict: "note_id,tag_id" }
      );
  }

  // エンベディング自動生成（検索に登録）
  if (note) {
    const text = `${title}\n\n${content}`;
    const chunks = chunkText(text);
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      if (embedding) {
        await supabase.from("note_embeddings").insert({
          note_id: note.id,
          content: chunk,
          embedding,
        });
      }
    }
  }

  // インタラクション記録
  await supabase.from("user_topic_interactions").upsert(
    {
      user_id: user.id,
      topic_id: topicId,
      action: "saved",
    },
    { onConflict: "user_id,topic_id,action" }
  );

  return NextResponse.json({ success: true, noteId: note?.id });
}
