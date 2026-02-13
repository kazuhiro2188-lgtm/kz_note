const HN_API = "https://hacker-news.firebaseio.com/v0";

// AI関連のキーワード（小文字で比較）
const AI_KEYWORDS = [
  "ai", "artificial intelligence", "machine learning", "deep learning",
  "llm", "gpt", "claude", "openai", "anthropic", "gemini", "llama",
  "neural", "transformer", "diffusion", "langchain", "rag",
  "chatbot", "copilot", "agent", "embedding", "fine-tuning",
  "stable diffusion", "midjourney", "generative",
];

type HNItem = {
  id: number;
  title?: string;
  url?: string;
  score?: number;
  by?: string;
  time?: number;
  type?: string;
  descendants?: number;
};

function isAIRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return AI_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function fetchHackerNewsAITopics(
  maxItems = 15
): Promise<
  {
    title: string;
    description: string | null;
    source_url: string | null;
    source_id: string;
    score: number;
    tags: string[];
  }[]
> {
  // 上位500件のストーリーIDを取得
  const res = await fetch(`${HN_API}/topstories.json`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  const storyIds: number[] = await res.json();

  // 上位200件のみ確認（パフォーマンスのため）
  const checkIds = storyIds.slice(0, 200);

  // 並列でアイテム取得（10件ずつバッチ処理）
  const results: {
    title: string;
    description: string | null;
    source_url: string | null;
    source_id: string;
    score: number;
    tags: string[];
  }[] = [];

  for (let i = 0; i < checkIds.length && results.length < maxItems; i += 10) {
    const batch = checkIds.slice(i, i + 10);
    const items = await Promise.all(
      batch.map(async (id) => {
        try {
          const itemRes = await fetch(`${HN_API}/item/${id}.json`, {
            next: { revalidate: 0 },
          });
          if (!itemRes.ok) return null;
          return (await itemRes.json()) as HNItem;
        } catch {
          return null;
        }
      })
    );

    for (const item of items) {
      if (
        !item ||
        !item.title ||
        item.type !== "story" ||
        results.length >= maxItems
      )
        continue;

      if (isAIRelated(item.title)) {
        const tags: string[] = ["AI"];
        const lower = item.title.toLowerCase();
        if (lower.includes("llm") || lower.includes("gpt") || lower.includes("claude"))
          tags.push("LLM");
        if (lower.includes("open source") || lower.includes("llama"))
          tags.push("オープンソース");
        if (lower.includes("agent")) tags.push("AIエージェント");

        results.push({
          title: item.title,
          description: item.url
            ? `Hacker News (${item.score ?? 0} points, ${item.descendants ?? 0} comments)`
            : null,
          source_url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
          source_id: String(item.id),
          score: item.score ?? 0,
          tags,
        });
      }
    }
  }

  return results;
}
