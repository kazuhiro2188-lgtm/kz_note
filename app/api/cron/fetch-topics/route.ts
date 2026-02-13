import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchHackerNewsAITopics } from "@/lib/topics/fetch-hackernews";
import { fetchDevToAITopics } from "@/lib/topics/fetch-devto";
import { generateEmbedding } from "@/lib/ai/embeddings";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type TopicData = {
  title: string;
  description: string | null;
  source_url: string | null;
  source_id: string;
  score: number;
  tags: string[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdmin = any;

async function upsertTopicWithEmbedding(
  supabase: SupabaseAdmin,
  topic: TopicData,
  source: string
) {
  // エンベディング生成（タイトル + 説明文）
  const textForEmbedding = [topic.title, topic.description]
    .filter(Boolean)
    .join(". ");
  const embedding = await generateEmbedding(textForEmbedding);

  const { error } = await supabase.from("daily_topics").upsert(
    {
      title: topic.title,
      description: topic.description,
      source_url: topic.source_url,
      source,
      source_id: topic.source_id,
      score: topic.score,
      tags: topic.tags,
      embedding,
    },
    { onConflict: "source,source_id" }
  );

  return error;
}

export async function GET(request: Request) {
  // Vercel Cron Secret で認証
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Service Role Key を使って RLS をバイパス（Cron は認証ユーザーなし）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let totalInserted = 0;
  const errors: string[] = [];

  // 1. Hacker News からAI関連トピックを取得
  try {
    const hnTopics = await fetchHackerNewsAITopics(15);
    for (const topic of hnTopics) {
      const error = await upsertTopicWithEmbedding(supabase, topic, "hackernews");
      if (!error) totalInserted++;
      else if (error.code !== "23505") errors.push(`HN: ${error.message}`);
    }
  } catch (e) {
    errors.push(`HN fetch error: ${e instanceof Error ? e.message : "unknown"}`);
  }

  // 2. Dev.to からAI関連記事を取得
  try {
    const devtoTopics = await fetchDevToAITopics(10);
    for (const topic of devtoTopics) {
      const error = await upsertTopicWithEmbedding(supabase, topic, "devto");
      if (!error) totalInserted++;
      else if (error.code !== "23505") errors.push(`DevTo: ${error.message}`);
    }
  } catch (e) {
    errors.push(`DevTo fetch error: ${e instanceof Error ? e.message : "unknown"}`);
  }

  // 3. 7日より古いトピックを削除（クリーンアップ）
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("daily_topics").delete().lt("fetched_at", weekAgo);

  return NextResponse.json({
    success: true,
    inserted: totalInserted,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  });
}
