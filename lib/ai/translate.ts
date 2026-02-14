import Anthropic from "@anthropic-ai/sdk";

/**
 * 英語のタイトル・説明文を日本語に翻訳する
 */
export async function translateToJapanese(
  title: string,
  description: string | null
): Promise<{ title: string; description: string | null }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { title, description };

  const anthropic = new Anthropic({ apiKey });

  const textToTranslate = [title, description].filter(Boolean).join("\n");
  if (!textToTranslate.trim()) return { title, description };

  const prompt = `以下の英語のテキストを自然な日本語に翻訳してください。
技術・AI関連の用語は適宜カタカナで（例: LLM、GPT、RAG）。
JSON形式のみで応答（\`\`\`json は不要）:
{"title":"翻訳したタイトル","description":"翻訳した説明文（元がnullや空の場合はnull）"}

翻訳するテキスト:
"""
${textToTranslate.slice(0, 500)}
"""`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text"
        ? response.content[0].text
        : "";
    const parsed = JSON.parse(text.trim()) as {
      title?: string;
      description?: string | null;
    };

    return {
      title: parsed.title?.trim() || title,
      description:
        parsed.description !== undefined && parsed.description !== null
          ? String(parsed.description).trim()
          : description,
    };
  } catch {
    return { title, description };
  }
}
