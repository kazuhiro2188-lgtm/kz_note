import { chunkText } from "@/lib/ai/embeddings";

describe("chunkText", () => {
  it("空文字の場合は1つのチャンクとして返す", () => {
    expect(chunkText("")).toEqual([""]);
  });

  it("短文は1つのチャンク", () => {
    const text = "短いメモです";
    expect(chunkText(text)).toEqual([text]);
  });

  it("maxChunkSizeを超えると複数チャンクに分割", () => {
    const lines = Array(20).fill("あいうえおかきくけこ").join("\n");
    const chunks = chunkText(lines, 50);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk) => {
      expect(chunk.length).toBeLessThanOrEqual(60);
    });
  });

  it("改行で区切られた長文を適切に分割", () => {
    const text = "行1\n行2\n行3\n行4\n行5";
    const chunks = chunkText(text, 10);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks.join("\n")).toContain("行1");
  });

  it("デフォルトのmaxChunkSizeは500", () => {
    const longLine = "a".repeat(600);
    const chunks = chunkText(longLine);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
  });
});
