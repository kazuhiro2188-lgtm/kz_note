import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // タグ別知識分布
  const { data: tagStats } = await supabase.rpc("get_user_knowledge_stats", {
    p_user_id: user.id,
  });

  // 全体のノート数
  const { count: totalNotes } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("deleted_at", null);

  // エンベディング済みノート数
  const { data: embeddedNotes } = await supabase
    .from("note_embeddings")
    .select("note_id")
    .limit(1000);
  const uniqueEmbeddedCount = new Set(
    (embeddedNotes ?? []).map((e) => e.note_id)
  ).size;

  // 保存したトピック数
  const { count: savedTopics } = await supabase
    .from("user_topic_interactions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("action", "saved");

  return NextResponse.json({
    tagStats: tagStats ?? [],
    totalNotes: totalNotes ?? 0,
    embeddedNotes: uniqueEmbeddedCount,
    savedTopics: savedTopics ?? 0,
  });
}
