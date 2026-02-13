import { render, screen, fireEvent } from "@testing-library/react";
import { SemanticSearch } from "@/components/SemanticSearch";

describe("SemanticSearch", () => {
  it("検索入力とボタンが表示される", () => {
    render(<SemanticSearch />);

    expect(
      screen.getByPlaceholderText("メモをセマンティック検索...")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "検索" })).toBeInTheDocument();
  });

  it("空のままでは検索ボタンが無効", () => {
    render(<SemanticSearch />);
    expect(screen.getByRole("button", { name: "検索" })).toBeDisabled();
  });

  it("入力すると検索ボタンが有効になる", () => {
    render(<SemanticSearch />);
    const input = screen.getByPlaceholderText("メモをセマンティック検索...");
    fireEvent.change(input, { target: { value: "テスト" } });
    expect(screen.getByRole("button", { name: "検索" })).not.toBeDisabled();
  });

  it("検索ボタンクリックで検索が実行される", async () => {
    const mockFetch = jest.fn().mockResolvedValue({ json: () => Promise.resolve({ results: [] }) });
    global.fetch = mockFetch;

    render(<SemanticSearch />);
    const input = screen.getByPlaceholderText("メモをセマンティック検索...");
    fireEvent.change(input, { target: { value: "テスト" } });
    fireEvent.click(screen.getByRole("button", { name: "検索" }));

    await screen.findByRole("button", { name: "検索" });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/ai/search",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "テスト" }),
      })
    );
  });
});
