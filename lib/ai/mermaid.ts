import Anthropic from "@anthropic-ai/sdk";

export async function generateMermaidFlowchart(content: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const anthropic = new Anthropic({ apiKey });

  const prompt = `以下のメモ内容を分析し、Mermaidのflowchart形式で図解を生成してください。
- 処理の流れ、因果関係、ステップを表現する
- 有効なMermaid構文のみを出力（\`\`\`mermaid は不要、コードブロックなし）
- 日本語ラベルを使用

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
