import { render, screen } from "@testing-library/react";
import { TagFilter } from "@/components/TagFilter";

describe("TagFilter", () => {
  it("タグがない場合は何も表示しない", () => {
    render(<TagFilter tags={[]} currentTag={null} />);
    expect(screen.queryByText("すべて")).not.toBeInTheDocument();
  });

  it("タグがある場合は「すべて」とタグを表示", () => {
    const tags = [
      { id: "1", name: "議事録", color: null },
      { id: "2", name: "学習", color: "#FF0000" },
    ];
    render(<TagFilter tags={tags} currentTag={null} />);

    expect(screen.getByText("すべて")).toBeInTheDocument();
    expect(screen.getByText("#議事録")).toBeInTheDocument();
    expect(screen.getByText("#学習")).toBeInTheDocument();
  });

  it("現在のタグが選択されている場合の表示", () => {
    const tags = [{ id: "1", name: "議事録", color: null }];
    render(<TagFilter tags={tags} currentTag="議事録" />);

    const tagLink = screen.getByText("#議事録");
    expect(tagLink).toBeInTheDocument();
    expect(tagLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("タグリンクのhrefが正しい", () => {
    const tags = [{ id: "1", name: "test", color: null }];
    render(<TagFilter tags={tags} currentTag={null} />);

    expect(screen.getByRole("link", { name: "#test" })).toHaveAttribute(
      "href",
      "/?tag=test"
    );
  });
});
