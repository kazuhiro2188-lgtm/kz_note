"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "ホーム", icon: "home" },
    { href: "/chat", label: "チャット", icon: "chat" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-[var(--bg-primary)]/95 backdrop-blur-xl border-t border-[var(--border)] safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-[1280px] mx-auto">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition ${
                isActive
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <NavIcon name={item.icon} active={isActive} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavIcon({ name, active }: { name: string; active?: boolean }) {
  const size = 24;
  if (name === "home") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 2}
      >
        <path d="M12 2L2 10v12h8v-8h4v8h8V10L12 2z" />
      </svg>
    );
  }
  if (name === "chat") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return null;
}
