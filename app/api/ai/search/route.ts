import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { NextResponse } from "next/server";

/** #タグ名 形式かどうか判定し、タグ名を抽出 */
function parseTagQuery(query: string): string | null {
  const trimmed = query.trim();
  const match = trimmed.match(/^#\s*(.+)$/);
  return match ? match[1].trim() : null;
}

export async function POST(request: Request) {
  const { query } = await request.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "query required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tagName = parseTagQuery(query);

  // #タグ検索: タグ名でフィルタ
  if (tagName) {
    const { data: tagRow } = await supabase
      .from("tags")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", tagName)
      .single();

    if (!tagRow) {
      return NextResponse.json({ results: [] });
    }

    const { data: links } = await supabase
      .from("note_tags")
      .select("note_id")
      .eq("tag_id", tagRow.id);

    const noteIds = (links ?? []).map((l) => l.note_id);
    if (noteIds.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const { data: notes } = await supabase
      .from("notes")
      .select("id, content")
      .in("id", noteIds)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .limit(10);

    const results = (notes ?? []).map((n) => ({
      note_id: n.id,
      content: n.content?.slice(0, 200) ?? "",
      similarity: 1,
    }));

    return NextResponse.json({ results });
  }

  // 意味検索（エンベディング）
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 503 }
    );
  }

  const embedding = await generateEmbedding(query);
  if (!embedding) {
    return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 });
  }

  const { data: matches, error } = await supabase.rpc("match_note_embeddings", {
    query_embedding: embedding,
    match_user_id: user.id,
    match_threshold: 0.3,
    match_count: 10,
  });

  if (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ results: matches ?? [] });
}
