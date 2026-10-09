"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Search, Library, Settings, 
  Globe, Zap, Sparkles, Star, ListMusic, Mic2, 
  Music, Disc, UserCircle, Plus, Heart, Download, HelpCircle 
} from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { closeFullScreen } = usePlayerStore();

  if (pathname?.startsWith('/admin')) return null;

  const NavContent = () => (
    <div className="flex flex-col h-full py-6 px-4 overflow-y-auto custom-scrollbar">
      <div className="mb-8 px-2 flex items-center justify-between">
        <Link href="/" onClick={() => closeFullScreen()} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-light-silver dark:border-surface-ash group-hover:scale-105 transition-transform">
            <img src="/logo.jpg" alt="T-Tune Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-app-logo text-brand-dark dark:text-brand-light">T-Tune</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-6 flex-1 pb-10">
        <div>
          <Link href="/" onClick={() => closeFullScreen()} className="flex items-center gap-3 px-2 py-2 text-text-dark dark:text-text-white hover:text-primary transition-colors group">
            <Home size={20} className="group-hover:text-primary" />
            <span className="text-nav font-bold">Home</span>
          </Link>
          <div className="flex flex-col gap-1 mt-2 pl-9 border-l border-light-silver dark:border-surface-ash ml-4">
            <NavItem href="/#languages" icon={<Globe size={16} />} text="Languages" active={pathname === "/#languages"} />
            <NavItem href="/#speed-list" icon={<Zap size={16} />} text="Speed List" active={pathname === "/#speed-list"} />
            <NavItem href="/#quick-picks" icon={<Sparkles size={16} />} text="Quick Picks" active={pathname === "/#quick-picks"} />
            <NavItem href="/#suggested" icon={<Star size={16} />} text="Suggested For You" active={pathname === "/#suggested"} />
            <NavItem href="/#featured" icon={<ListMusic size={16} />} text="Featured Playlist" active={pathname === "/#featured"} />
            <NavItem href="/#artists" icon={<Mic2 size={16} />} text="Artists" active={pathname === "/#artists"} />
          </div>
        </div>

        <div>
          <Link href="/search" onClick={() => closeFullScreen()} className="flex items-center gap-3 px-2 py-2 text-text-dark dark:text-text-white hover:text-primary transition-colors group">
            <Search size={20} className="group-hover:text-primary" />
            <span className="text-nav font-bold">Search</span>
          </Link>
          <div className="flex flex-col gap-1 mt-2 pl-9 border-l border-light-silver dark:border-surface-ash ml-4">
            <NavItem href="/search#songs" icon={<Music size={16} />} text="Songs" active={pathname === "/search#songs"} />
            <NavItem href="/search#albums" icon={<Disc size={16} />} text="Albums" active={pathname === "/search#albums"} />
            <NavItem href="/search#artists" icon={<UserCircle size={16} />} text="Artists" active={pathname === "/search#artists"} />
          </div>
        </div>

        <div>
          <Link href="/library" onClick={() => closeFullScreen()} className="flex items-center gap-3 px-2 py-2 text-text-dark dark:text-text-white hover:text-primary transition-colors group">
            <Library size={20} className="group-hover:text-primary" />
            <span className="text-nav font-bold">Library</span>
          </Link>
          <div className="flex flex-col gap-1 mt-2 pl-9 border-l border-light-silver dark:border-surface-ash ml-4">
            <NavItem href="/library#create" icon={<Plus size={16} />} text="Create Playlists" active={pathname === "/library#create"} />
            <NavItem href="/library#liked" icon={<Heart size={16} />} text="Favourite Songs" active={pathname === "/library#liked"} />
          </div>
        </div>

        <div>
          <Link href="/settings" onClick={() => closeFullScreen()} className="flex items-center gap-3 px-2 py-2 text-text-dark dark:text-text-white hover:text-primary transition-colors group">
            <Settings size={20} className="group-hover:text-primary" />
            <span className="text-nav font-bold">Settings</span>
          </Link>
          <div className="flex flex-col gap-1 mt-2 pl-9 border-l border-light-silver dark:border-surface-ash ml-4">
            <NavItem href="/settings#install" icon={<Download size={16} />} text="Install App" active={pathname === "/settings#install"} />
            <NavItem href="/settings#how-it-works" icon={<HelpCircle size={16} />} text="How it Works?" active={pathname === "/settings#how-it-works"} />
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-full bg-light-pearl dark:bg-surface-cocoa border-r border-light-silver dark:border-surface-ash flex-shrink-0 z-10 relative">
        <NavContent />
      </aside>

      {/* Mobile Bottom Navigation Bar (Premium App Feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-light-ivory/95 dark:bg-bg-midnight/95 backdrop-blur-xl border-t border-light-silver dark:border-surface-ash z-50 flex items-center justify-around px-2 pb-safe">
        <BottomNavItem href="/" icon={<Home size={22} />} label="Home" active={pathname === "/"} />
        <BottomNavItem href="/search" icon={<Search size={22} />} label="Search" active={pathname.startsWith("/search")} />
        <BottomNavItem href="/library" icon={<Library size={22} />} label="Library" active={pathname.startsWith("/library") || pathname.startsWith("/playlists") || pathname === "/liked"} />
        <BottomNavItem href="/settings" icon={<Settings size={22} />} label="Settings" active={pathname.startsWith("/settings") || pathname === "/install" || pathname === "/how-it-works"} />
      </div>
    </>
  );
}

function NavItem({ href, icon, text, active }: { href: string; icon: React.ReactNode; text: string; active?: boolean }) {
  const { closeFullScreen } = usePlayerStore();
  return (
    <Link 
      href={href} 
      onClick={() => closeFullScreen()}
      className={`flex items-center gap-3 py-1.5 px-2 transition-colors text-body ${
        active 
          ? "text-primary font-bold" 
          : "text-text-secondary dark:text-text-muted hover:text-text-dark dark:hover:text-text-white"
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

function BottomNavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  const { closeFullScreen } = usePlayerStore();
  return (
    <Link 
      href={href} 
      onClick={() => closeFullScreen()}
      className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
        active ? "text-primary" : "text-text-secondary dark:text-text-muted hover:text-text-dark dark:hover:text-text-white"
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold tracking-wider uppercase">{label}</span>
    </Link>
  );
}
