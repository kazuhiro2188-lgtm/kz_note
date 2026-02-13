const DEVTO_API = "https://dev.to/api/articles";

type DevToArticle = {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  positive_reactions_count: number;
  tag_list: string[];
  user: { name: string };
};

const AI_TAGS = ["ai", "machinelearning", "llm", "openai", "deeplearning", "gpt"];

export async function fetchDevToAITopics(
  maxItems = 10
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
  const results: {
    title: string;
    description: string | null;
    source_url: string | null;
    source_id: string;
    score: number;
    tags: string[];
  }[] = [];

  // 複数のAIタグで検索
  const seenIds = new Set<number>();

  for (const tag of AI_TAGS) {
    if (results.length >= maxItems) break;

    try {
      const res = await fetch(
        `${DEVTO_API}?tag=${tag}&top=7&per_page=10`,
        { next: { revalidate: 0 } }
      );
      if (!res.ok) continue;

      const articles: DevToArticle[] = await res.json();

      for (const article of articles) {
        if (results.length >= maxItems) break;
        if (seenIds.has(article.id)) continue;
        seenIds.add(article.id);

        results.push({
          title: article.title,
          description: article.description || null,
          source_url: article.url,
          source_id: String(article.id),
          score: article.positive_reactions_count,
          tags: article.tag_list
            .filter((t) => t.length < 30)
            .slice(0, 5),
        });
      }
    } catch {
      continue;
    }
  }

  return results;
}
