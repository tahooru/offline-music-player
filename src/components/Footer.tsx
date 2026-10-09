"use client";

import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="w-full py-8 mt-12 border-t border-light-silver dark:border-surface-ash flex flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="text-metadata text-text-secondary dark:text-text-muted">
        Created by <span className="font-bold text-primary">Mohammed Tahoor</span>
      </p>
      <div className="flex items-center gap-4 mt-1">
        <a href="https://instagram.com/tahooru" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition-colors" aria-label="Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
          </svg>
        </a>
        <a href="mailto:mdtahoor.bca@gmail.com" className="text-text-muted hover:text-primary transition-colors" aria-label="Email">
          <Mail size={18} />
        </a>
      </div>
      <p className="text-player-time text-text-muted opacity-80 mt-1">
        © {new Date().getFullYear()} All Rights Reserved.
      </p>
      <p className="text-[10px] text-text-muted opacity-60 mt-1">
        All devices friendly • Offline Capable PWA
      </p>
    </footer>
  );
}
