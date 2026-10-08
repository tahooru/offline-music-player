"use client";

import { usePathname } from "next/navigation";
import { usePlayerStore } from "@/store/playerStore";

export function PlayerSpacer() {
  const pathname = usePathname();
  const { currentSong } = usePlayerStore();

  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    // Admin has no mobile nav and no global player, so we need 0 extra space at bottom
    return null;
  }

  return (
    <>
      {/* Mobile Nav Spacer (Always there on non-admin routes) */}
      <div className="md:hidden w-full h-[68px] flex-shrink-0" />
      
      {/* Global Player Spacer (Only there when a song is playing) */}
      {currentSong && (
        <div className="w-full h-[64px] md:h-[90px] flex-shrink-0" />
      )}
    </>
  );
}
