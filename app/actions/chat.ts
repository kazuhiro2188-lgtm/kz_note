"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createChatSession(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kz_chat_sessions")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath("/chat");
  return data.id;
}

export async function deleteChatSession(sessionId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("kz_chat_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) throw error;
  revalidatePath("/chat");
}
