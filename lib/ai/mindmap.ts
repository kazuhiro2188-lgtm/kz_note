import Anthropic from "@anthropic-ai/sdk";

export async function generateMermaidMindmap(content: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const anthropic = new Anthropic({ apiKey });

  const prompt = `以下のメモ内容を分析し、Mermaidのmindmap形式でマインドマップを生成してください。
- 中心トピックから関連概念を枝分かれさせて表現
- 階層は2〜3レベル程度
- 有効なMermaid構文のみを出力（\`\`\`mermaid は不要、コードブロックなし）
- 日本語ラベルを使用
- 形式例: mindmap\\n  root((中心))\\n    枝1\\n      葉1\\n    枝2

メモ内容:
"""
${content.slice(0, 3000)}
"""`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text"
        ? response.content[0].text
        : "";
    return text.trim() || null;
  } catch {
    return null;
  }
}
