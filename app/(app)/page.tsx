import { createClient } from "@/lib/supabase/server";
import { NoteList } from "@/components/NoteList";
import { NoteComposer } from "@/components/NoteComposer";
import { TagFilter } from "@/components/TagFilter";
import { TimelineTabs } from "@/components/TimelineTabs";
import { TopicFeed } from "@/components/TopicFeed";
import { KnowledgeMap } from "@/components/KnowledgeMap";

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
      <div className="py-20 text-center text-[var(--text-muted)]">
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
    <div className="flex gap-0 lg:gap-6 px-4 py-4">
      {/* 左カラム: メモ入力 + タイムライン */}
      <div className="flex-1 min-w-0 flex flex-col gap-0">
        {/* モバイル: トピックフィード */}
        {tab === "all" && (
          <div className="lg:hidden bg-[var(--bg-secondary)] rounded-xl overflow-hidden mb-4">
            <TopicFeed userId={user.id} />
          </div>
        )}

        {/* メモ入力 */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-4">
          <NoteComposer userId={user.id} tags={allTags ?? []} />
        </div>

        {/* タブ + タグフィルター */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <TimelineTabs currentTab={tab} inline />
          <div className="flex-1 min-w-0 overflow-x-auto">
            <TagFilter tags={allTags ?? []} currentTag={filterTag ?? null} />
          </div>
        </div>

        {/* タイムライン */}
        <div className="flex-1">
          <NoteList
            notes={notesWithTags}
            userId={user.id}
            emptyMessage={
              tab === "threads"
                ? "スレッド機能は準備中です。"
                : "まだメモがありません。上のフォームから投稿してみましょう。"
            }
          />
        </div>
      </div>

      {/* 右カラム: トピック + ナレッジマップ (デスクトップ) */}
      <aside className="hidden lg:flex flex-col w-[380px] shrink-0 gap-4">
        {tab === "all" && (
          <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden sticky top-20">
            <TopicFeed userId={user.id} />
          </div>
        )}

        <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
          <KnowledgeMap />
        </div>
      </aside>
    </div>
  );
}
