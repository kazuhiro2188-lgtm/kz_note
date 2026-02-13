import { createClient } from "@/lib/supabase/server";
import { KnowledgeChat } from "@/components/KnowledgeChat";

export default async function ChatPage() {
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

  const { data: sessions } = await supabase
    .from("kz_chat_sessions")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col flex-1">
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full flex-1">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[var(--text-primary)] font-display">ナレッジチャット</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            メモの内容を参照して質問に答えます。まずメモを投稿し、埋め込みを生成してください。
          </p>
        </div>
        <KnowledgeChat userId={user.id} sessions={sessions ?? []} />
      </div>
    </div>
  );
}
