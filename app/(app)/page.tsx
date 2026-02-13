import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { NoteList } from "@/components/NoteList";
import { NoteComposer } from "@/components/NoteComposer";
import { TagFilter } from "@/components/TagFilter";
import { TimelineTabs } from "@/components/TimelineTabs";
import { TopicFeed } from "@/components/TopicFeed";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; tab?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/30 py-16 text-center text-[var(--text-muted)]">
        読み込み中...
      </div>
    );
  }

  const { tag: filterTag, tab = "all" } = await searchParams;

  let noteIds: string[] | null = null;
  if (filterTag) {
    const { data: tagRow } = await supabase
      .from("tags")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", filterTag)
      .single();
    if (tagRow) {
      const { data: links } = await supabase
        .from("note_tags")
        .select("note_id")
        .eq("tag_id", tagRow.id);
      noteIds = links?.map((l) => l.note_id) ?? [];
    }
  }

  let query = supabase
    .from("notes")
    .select(`
      *,
      note_tags(tags(id, name, color)),
      note_ai_generations(content, generation_type)
    `)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (tab === "drafts") {
    query = query.eq("is_draft", true);
  } else if (tab === "all") {
    query = query.eq("is_draft", false);
  } else if (tab === "threads") {
    query = query.eq("id", "00000000-0000-0000-0000-000000000000");
  }

  if (noteIds !== null && tab !== "threads") {
    if (noteIds.length === 0) {
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      query = query.in("id", noteIds);
    }
  }

  const { data: notes } = await query;

  const { data: allTags } = await supabase
    .from("tags")
    .select("id, name, color")
    .eq("user_id", user.id)
    .order("name");

  type NoteRow = {
    id: string;
    title: string;
    content: string;
    created_at: string;
    note_tags?: { tags: { id: string; name: string; color: string | null } }[];
    note_ai_generations?: { content: string; generation_type: string }[];
  };

  const notesWithTags = (notes ?? []).map((n: NoteRow) => {
    const summary = n.note_ai_generations?.find((g) => g.generation_type === "summary")?.content;
    const flowchart = n.note_ai_generations?.find((g) => g.generation_type === "flowchart")?.content;
    const mindmap = n.note_ai_generations?.find((g) => g.generation_type === "mindmap")?.content;
    return {
      id: n.id,
      title: n.title,
      content: n.content,
      created_at: n.created_at,
      summary: summary ?? null,
      flowchart: flowchart ?? null,
      mindmap: mindmap ?? null,
      tags: (n.note_tags ?? []).map((nt) => nt.tags).filter(Boolean),
    };
  });

  return (
    <div className="flex flex-col min-h-0">
      {/* ヘッダー - Composeの上位（タブ） */}
      <header className="border-b border-[var(--border)]">
        <TimelineTabs currentTab={tab} />
      </header>
      {/* Compose - X風 ツイート入力 */}
      <div className="px-4 py-4 border-b border-[var(--border)]">
        <Link href="/" className="xl:hidden inline-block p-2 -ml-2 mb-2 rounded-full hover:bg-[var(--bg-hover)] transition">
          <Image
            src="/logo-sidebar.png"
            alt="kz_note"
            width={28}
            height={28}
            className="h-7 w-auto object-contain"
          />
        </Link>
        <NoteComposer userId={user.id} tags={allTags ?? []} />
      </div>

      {/* Daily AI Topics */}
      {tab === "all" && <TopicFeed userId={user.id} />}

      {/* Filter */}
      <div className="px-4 py-2 border-b border-[var(--border)]">
        <TagFilter tags={allTags ?? []} currentTag={filterTag ?? null} />
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <NoteList
          notes={notesWithTags}
          userId={user.id}
          emptyMessage={tab === "threads" ? "スレッド機能は準備中です。" : undefined}
        />
      </div>
    </div>
  );
}
