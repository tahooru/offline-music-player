"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="w-full py-8 mt-12 border-t border-light-silver dark:border-surface-ash flex flex-col items-center justify-center gap-2 mb-24 md:mb-0">
      <p className="text-metadata text-text-secondary dark:text-text-muted">
        Created by <span className="font-bold text-primary">Mohammed Tahoor</span>
      </p>
      <p className="text-player-time text-text-muted opacity-70">
        All devices friendly • Offline Capable PWA
      </p>
    </footer>
  );
}
