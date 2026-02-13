import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { NextResponse } from "next/server";

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
