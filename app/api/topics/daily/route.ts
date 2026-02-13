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

  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // パーソナライズRPC関数で取得を試行
  const { data: personalizedTopics, error: rpcError } = await supabase.rpc(
    "match_topics_for_user",
    {
      p_user_id: user.id,
      p_since: since,
      p_limit: 20,
    }
  );

  let topics;
  if (rpcError || !personalizedTopics || personalizedTopics.length === 0) {
    // フォールバック: スコア順で取得
    const { data: fallbackTopics } = await supabase
      .from("daily_topics")
      .select("*")
      .gte("fetched_at", since)
      .order("score", { ascending: false })
      .limit(20);

    topics = (fallbackTopics ?? []).map((t) => ({
      ...t,
      relevance_score: 0,
    }));
  } else {
    // RPC結果をマッピング
    topics = personalizedTopics.map((t: {
      topic_id: string;
      title: string;
      description: string | null;
      source_url: string | null;
      source: string;
      source_id: string | null;
      score: number;
      tags: string[];
      fetched_at: string;
      created_at: string;
      relevance_score: number;
    }) => ({
      id: t.topic_id,
      title: t.title,
      description: t.description,
      source_url: t.source_url,
      source: t.source,
      source_id: t.source_id,
      score: t.score,
      tags: t.tags,
      fetched_at: t.fetched_at,
      created_at: t.created_at,
      relevance_score: t.relevance_score,
    }));
  }

  // ユーザーが既に操作したトピックを取得
  const topicIds = topics.map((t: { id: string }) => t.id);
  const { data: interactions } =
    topicIds.length > 0
      ? await supabase
          .from("user_topic_interactions")
          .select("topic_id, action")
          .eq("user_id", user.id)
          .in("topic_id", topicIds)
      : { data: [] };

  const interactionMap = new Map<string, string[]>();
  for (const i of interactions ?? []) {
    const actions = interactionMap.get(i.topic_id) ?? [];
    actions.push(i.action);
    interactionMap.set(i.topic_id, actions);
  }

  const enrichedTopics = topics.map((t: { id: string; relevance_score: number }) => ({
    ...t,
    user_actions: interactionMap.get(t.id) ?? [],
  }));

  return NextResponse.json({ topics: enrichedTopics });
}
