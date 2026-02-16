import { createClient } from "@/lib/supabase/server";
import { generateEmbedding, chunkText } from "@/lib/ai/embeddings";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { noteId } = await request.json();
  if (!noteId) {
    return NextResponse.json({ error: "noteId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: note } = await supabase
    .from("notes")
    .select("id, title, content, user_id")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .single();

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 503 }
    );
  }

  try {
    await supabase.from("note_embeddings").delete().eq("note_id", noteId);

    const text = `${note.title}\n\n${note.content}`;
    const chunks = chunkText(text);

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      if (embedding) {
        await supabase.from("note_embeddings").insert({
          note_id: noteId,
          content: chunk,
          embedding,
        });
      }
    }

    return NextResponse.json({ success: true, chunks: chunks.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "埋め込みの生成に失敗しました";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
