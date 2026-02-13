"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateTitleAndSummary } from "@/lib/ai/claude";

function generateSimpleTitle(content: string): string {
  const firstLine = content.split("\n")[0]?.trim() ?? "";
  if (!firstLine) return "無題";
  return firstLine.length > 50 ? firstLine.slice(0, 50) + "…" : firstLine;
}

function parseTagsFromContent(content: string): string[] {
  const matches = content.match(/#[\w\u3040-\u309f\u30a0-\u30ff]+/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}

export async function createNote({
  userId,
  content,
  tagNames = [],
}: {
  userId: string;
  content: string;
  tagNames?: string[];
}) {
  const supabase = await createClient();

  // AI でタイトル・要約生成（APIキーがある場合）
  let title = generateSimpleTitle(content);
  const aiResult = await generateTitleAndSummary(content);
  if (aiResult) {
    title = aiResult.title;
  }

  const { data: note, error: insertError } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      title,
      content,
      content_type: "text",
      is_draft: false,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;

  // AI要約を保存
  if (aiResult?.summary) {
    await supabase.from("note_ai_generations").insert({
      note_id: note.id,
      generation_type: "summary",
      content: aiResult.summary,
    });
  }

  // タグ処理（本文の #tag + 明示指定）
  const allTags = [...new Set([...parseTagsFromContent(content), ...tagNames])];
  for (const name of allTags) {
    let tagId: string | null = null;
    const { data: existing } = await supabase
      .from("tags")
      .select("id")
      .eq("user_id", userId)
      .eq("name", name)
      .single();

    if (existing) {
      tagId = existing.id;
    } else {
      const { data: inserted } = await supabase
        .from("tags")
        .insert({ user_id: userId, name })
        .select("id")
        .single();
      tagId = inserted?.id ?? null;
    }

    if (tagId) {
      const { error } = await supabase
        .from("note_tags")
        .insert({ note_id: note.id, tag_id: tagId });
      // 23505 = unique violation（重複は無視）
      if (error && error.code !== "23505") throw error;
    }
  }

  revalidatePath("/");
  return { noteId: note.id };
}

export async function updateNote({
  noteId,
  title,
  content,
}: {
  noteId: string;
  title: string;
  content: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notes")
    .update({ title, content })
    .eq("id", noteId);

  if (error) throw error;
  revalidatePath("/");
}

export async function deleteNote(noteId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", noteId);

  if (error) throw error;
  revalidatePath("/");
}

export async function addTagToNote({
  noteId,
  tagName,
  userId,
}: {
  noteId: string;
  tagName: string;
  userId: string;
}) {
  const supabase = await createClient();
  const normalized = tagName.replace(/^#/, "").trim().toLowerCase();
  if (!normalized) return;

  let tagId: string | null = null;
  const { data: existing } = await supabase
    .from("tags")
    .select("id")
    .eq("user_id", userId)
    .eq("name", normalized)
    .single();

  if (existing) {
    tagId = existing.id;
  } else {
    const { data: inserted } = await supabase
      .from("tags")
      .insert({ user_id: userId, name: normalized })
      .select("id")
      .single();
    tagId = inserted?.id ?? null;
  }

  if (tagId) {
    const { error } = await supabase
      .from("note_tags")
      .insert({ note_id: noteId, tag_id: tagId });
    if (error && error.code !== "23505") throw error;
  }
  revalidatePath("/");
}

export async function removeTagFromNote({
  noteId,
  tagId,
}: {
  noteId: string;
  tagId: string;
}) {
  const supabase = await createClient();
  await supabase.from("note_tags").delete().eq("note_id", noteId).eq("tag_id", tagId);
  revalidatePath("/");
}
