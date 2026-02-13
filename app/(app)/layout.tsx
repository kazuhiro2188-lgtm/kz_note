import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { AppTopbar } from "@/components/AppTopbar";
import { BottomNav } from "@/components/BottomNav";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import { SidebarProvider } from "@/components/SidebarContext";
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
      <SidebarProvider>
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <AppShell user={user} tags={allTags ?? []}>
            <MainContentWrapper>
              <AppTopbar />
              <div className="flex-1 pb-16 xl:pb-0">{children}</div>
              <BottomNav />
            </MainContentWrapper>
          </AppShell>
        </div>
      </SidebarProvider>
    </AnonymousAuth>
  );
}
