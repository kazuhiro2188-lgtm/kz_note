import Link from "next/link";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="absolute top-4 left-4">
        <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition">
          ← 戻る
        </Link>
      </div>
      {children}
    </div>
  );
}
