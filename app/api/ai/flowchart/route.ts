import { createClient } from "@/lib/supabase/server";
import { generateMermaidFlowchart } from "@/lib/ai/mermaid";
import { revalidatePath } from "next/cache";
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
    .select("id, content, user_id")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .single();

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const mermaid = await generateMermaidFlowchart(note.content);
  if (!mermaid) {
    return NextResponse.json({ error: "Failed to generate flowchart" }, { status: 500 });
  }

  await supabase.from("note_ai_generations").insert({
    note_id: noteId,
    generation_type: "flowchart",
    content: mermaid,
  });

  revalidatePath("/");
  return NextResponse.json({ mermaid });
}
