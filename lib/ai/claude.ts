import Anthropic from "@anthropic-ai/sdk";

export type AiTitleSummary = {
  title: string;
  summary: string;
};

export async function generateTitleAndSummary(
  content: string
): Promise<AiTitleSummary | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const anthropic = new Anthropic({ apiKey });

  const prompt = `以下のメモ本文を分析し、JSON形式で応答してください。
- title: 簡潔なタイトル（20文字以内）
- summary: 3〜5行の要点まとめ（各1行で、箇条書き風）

メモ本文:
"""
${content.slice(0, 3000)}
"""

JSON形式のみで応答（\`\`\`json は不要）:
{"title":"...","summary":"..."}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text"
        ? response.content[0].text
        : "";
    const parsed = JSON.parse(text.trim()) as AiTitleSummary;
    return {
      title: parsed.title?.slice(0, 100) ?? "無題",
      summary: parsed.summary ?? "",
    };
  } catch {
    return null;
  }
}
