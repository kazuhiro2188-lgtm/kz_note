"use client";

import { useSidebar } from "./SidebarContext";

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  return (
    <div
      className="flex flex-col min-h-screen"
      onClick={() => sidebarOpen && setSidebarOpen(false)}
    >
      {children}
    </div>
  );
}
