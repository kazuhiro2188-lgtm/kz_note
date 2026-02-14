import { createClient } from "@supabase/supabase-js";
import { fetchHackerNewsAITopics } from "@/lib/topics/fetch-hackernews";
import { fetchDevToAITopics } from "@/lib/topics/fetch-devto";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { translateToJapanese } from "@/lib/ai/translate";

type TopicData = {
  title: string;
  description: string | null;
  source_url: string | null;
  source_id: string;
  score: number;
  tags: string[];
};

/** 主に英語かどうか（日本語翻訳をスキップするか） */
function isMostlyJapanese(text: string): boolean {
  const jpChars = (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g) || []).length;
  return jpChars / Math.max(text.length, 1) > 0.3;
}

async function upsertTopicWithEmbedding(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  topic: TopicData,
  source: string
) {
  let title = topic.title;
  let description = topic.description;

  // 英語の場合は日本語に翻訳
  if (!isMostlyJapanese(topic.title)) {
    try {
      const translated = await translateToJapanese(topic.title, topic.description);
      title = translated.title;
      description = translated.description;
    } catch {
      // 翻訳失敗時は原文のまま
    }
  }

  const textForEmbedding = [title, description]
    .filter(Boolean)
    .join(". ");

  let embedding = null;
  try {
    embedding = await generateEmbedding(textForEmbedding);
  } catch {
    // エンベディング生成失敗時もトピックは保存
  }

  const { error } = await supabase.from("daily_topics").upsert(
    {
      title,
      description,
      source_url: topic.source_url,
      source,
      source_id: topic.source_id,
      score: topic.score,
      tags: topic.tags,
      ...(embedding ? { embedding } : {}),
    },
    { onConflict: "source,source_id" }
  );

  return error;
}

export async function fetchAndStoreTopics() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let totalInserted = 0;
  const errors: string[] = [];

  // 1. Hacker News
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

  // 2. Dev.to
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

  // 3. 7日より古いトピックを削除
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("daily_topics").delete().lt("fetched_at", weekAgo);

  return {
    success: true,
    inserted: totalInserted,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  };
}
