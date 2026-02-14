import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { BottomNav } from "@/components/BottomNav";
import { AnonymousAuth } from "@/components/AnonymousAuth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: allTags } = user
    ? await supabase
        .from("tags")
        .select("id, name, color")
        .eq("user_id", user.id)
        .order("name")
    : { data: [] };

  return (
    <AnonymousAuth>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <AppShell user={user} tags={allTags ?? []}>
          <div className="pb-16 lg:pb-0">{children}</div>
          <BottomNav />
        </AppShell>
      </div>
    </AnonymousAuth>
  );
}
