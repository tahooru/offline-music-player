"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Disc } from "lucide-react";
import { Song, usePlayerStore } from "@/store/playerStore";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SongInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

export function SongInfoModal({ isOpen, onClose, song }: SongInfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      window.history.pushState({ isSongInfoModal: true }, "");
      
      const handlePopState = () => {
        onClose();
      };
      window.addEventListener("popstate", handlePopState);
      
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isOpen, onClose]);

  const handleClose = () => {
    onClose();
    if (window.history.state?.isSongInfoModal) {
      window.history.back();
    }
  };

  const handleNavigate = (path: string) => {
    onClose();
    if (window.history.state?.isSongInfoModal) {
      window.history.back();
    }
    setTimeout(() => {
      usePlayerStore.getState().closeFullScreen();
      router.push(path);
    }, 10);
  };

  if (!song) return null;



  // Generate an avatar placeholder color based on string
  const getAvatarColor = (name: string) => {
    const colors = ["bg-status-success", "bg-status-warning", "bg-status-error", "bg-primary", "bg-music-lavender"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={(e) => { e.stopPropagation(); handleClose(); }}
             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
             ref={modalRef}
             onClick={(e) => e.stopPropagation()}
             initial={{ opacity: 0, scale: 0.95, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.95, y: 20 }}
             className="relative w-full max-w-md bg-light-ivory dark:bg-bg-charcoal border border-light-silver dark:border-surface-ash rounded-2xl shadow-2xl overflow-hidden z-10"
          >
             <div className="flex items-center justify-between p-6 border-b border-light-silver dark:border-surface-ash bg-light-pearl dark:bg-surface-cocoa">
               <h3 className="text-section-heading text-text-dark dark:text-text-white">More Info</h3>
               <button onClick={handleClose} className="p-2 -mr-2 text-text-muted hover:text-text-dark dark:hover:text-text-white transition-colors rounded-full hover:bg-light-silver dark:hover:bg-surface-ash">
                 <X size={20} />
               </button>
             </div>
             
             <div className="p-0 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="px-6 py-4">
                  {/* Artists */}
                  {song.singers && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-text-secondary dark:text-text-muted tracking-[0.1em] uppercase mb-2">Artists</p>
                      <div className="space-y-1">
                        {song.singers.split(",").map(s => s.trim()).filter(Boolean).map((name, i) => (
                          <div 
                            key={i} 
                            onClick={(e) => {
                               e.stopPropagation();
                               handleNavigate(`/artist/${encodeURIComponent(name)}`);
                            }}
                            className="flex items-center justify-between p-3 -mx-3 hover:bg-light-silver/50 dark:hover:bg-white/5 rounded-xl transition-colors group cursor-pointer border-b border-light-silver/30 dark:border-white/5 last:border-0"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-lg ${getAvatarColor(name)} shadow-sm`}>
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-text-dark dark:text-text-white">{name}</h4>
                                <p className="text-sm font-medium text-text-secondary dark:text-text-muted">Artist</p>
                              </div>
                            </div>
                            <button className="text-text-muted opacity-0 group-hover:opacity-100 hover:text-text-dark dark:hover:text-white p-2 transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Music (Composer) */}
                  {song.musician && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-text-secondary dark:text-text-muted tracking-[0.1em] uppercase mb-2">Music (Composer)</p>
                      <div className="space-y-1">
                        {song.musician.split(",").map(s => s.trim()).filter(Boolean).map((name, i) => (
                          <div 
                            key={i} 
                            onClick={(e) => {
                               e.stopPropagation();
                               handleNavigate(`/artist/${encodeURIComponent(name)}`);
                            }}
                            className="flex items-center justify-between p-3 -mx-3 hover:bg-light-silver/50 dark:hover:bg-white/5 rounded-xl transition-colors group cursor-pointer border-b border-light-silver/30 dark:border-white/5 last:border-0"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-lg ${getAvatarColor(name)} shadow-sm`}>
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-text-dark dark:text-text-white">{name}</h4>
                                <p className="text-sm font-medium text-text-secondary dark:text-text-muted">Composer</p>
                              </div>
                            </div>
                            <button className="text-text-muted opacity-0 group-hover:opacity-100 hover:text-text-dark dark:hover:text-white p-2 transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lyrics (Lyricist) */}
                  {song.lyricist && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-text-secondary dark:text-text-muted tracking-[0.1em] uppercase mb-2">Lyrics (Lyricist)</p>
                      <div className="space-y-1">
                        {song.lyricist.split(",").map(s => s.trim()).filter(Boolean).map((name, i) => (
                          <div 
                            key={i} 
                            onClick={(e) => {
                               e.stopPropagation();
                               handleNavigate(`/artist/${encodeURIComponent(name)}`);
                            }}
                            className="flex items-center justify-between p-3 -mx-3 hover:bg-light-silver/50 dark:hover:bg-white/5 rounded-xl transition-colors group cursor-pointer border-b border-light-silver/30 dark:border-white/5 last:border-0"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-lg ${getAvatarColor(name)} shadow-sm`}>
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-text-dark dark:text-text-white">{name}</h4>
                                <p className="text-sm font-medium text-text-secondary dark:text-text-muted">Lyricist</p>
                              </div>
                            </div>
                            <button className="text-text-muted opacity-0 group-hover:opacity-100 hover:text-text-dark dark:hover:text-white p-2 transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Album */}
                  {song.album && (
                    <div className="mb-6">
                      <p className="text-xs font-bold text-text-secondary dark:text-text-muted tracking-[0.1em] uppercase mb-2">Album</p>
                      <div className="space-y-1">
                        <div 
                          onClick={(e) => {
                             e.stopPropagation();
                             handleNavigate(`/album/${encodeURIComponent(song.album)}`);
                          }}
                          className="flex items-center justify-between p-3 -mx-3 hover:bg-light-silver/50 dark:hover:bg-white/5 rounded-xl transition-colors group cursor-pointer border-b border-light-silver/30 dark:border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-lg bg-primary shadow-sm">
                              <Disc size={20} />
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-text-dark dark:text-text-white">{song.album}</h4>
                              <p className="text-sm font-medium text-text-secondary dark:text-text-muted">Album</p>
                            </div>
                          </div>
                          <button className="text-text-muted opacity-0 group-hover:opacity-100 hover:text-text-dark dark:hover:text-white p-2 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Additional Info like Year */}
                <div className="px-6 pb-6 pt-2">
                  <p className="text-xs font-bold text-text-secondary dark:text-text-muted tracking-[0.1em] uppercase mb-4">Song Details</p>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-light-pearl dark:bg-surface-graphite p-4 rounded-xl border border-light-silver/50 dark:border-white/5">
                      <p className="text-xs font-bold text-text-secondary dark:text-text-muted uppercase mb-1">Year</p>
                      <p className="text-sm font-bold text-text-dark dark:text-text-white truncate">{song.year || "Unknown"}</p>
                    </div>
                  </div>
                </div>

             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
