import Anthropic from "@anthropic-ai/sdk";

export async function generateRagResponse(
  userMessage: string,
  context: string,
  chatHistory: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "AI が設定されていません。ANTHROPIC_API_KEY を設定してください。";

  const anthropic = new Anthropic({ apiKey });

  const systemPrompt = `あなたはユーザーのメモ・議事録を参照するナレッジアシスタントです。
以下の「参照メモ」は、ユーザーの質問と関連するメモの抜粋です。これらの内容を踏まえて回答してください。
参照メモにない質問には「メモに該当する情報が見つかりませんでした」と案内してください。
回答は簡潔に、箇条書きや段落を活用して分かりやすく書いてください。

【参照メモ】
${context || "（関連メモなし）"}`;

  const messages = [
    ...chatHistory.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return text;
}
