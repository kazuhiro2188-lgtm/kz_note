"use client";

import { useEffect, useRef, useState } from "react";

export function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || !ref.current) return;

    const loadMermaid = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
        });
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, code);
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "描画エラー");
      }
    };

    loadMermaid();
  }, [code]);

  if (error) {
    return (
      <div className="rounded-[10px] bg-[var(--bg-secondary)] border border-[var(--border-light)] p-4 text-sm text-red-400">
        図解の描画に失敗しました: {error}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="mermaid-diagram flex items-center justify-center overflow-auto rounded-[10px] bg-[var(--bg-secondary)] border border-[var(--border-light)] p-3.5 [&_svg]:max-w-full [&_svg]:h-auto"
    />
  );
}
