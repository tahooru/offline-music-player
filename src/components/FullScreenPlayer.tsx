"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MoreHorizontal, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Heart, Plus, ListPlus, Moon, MonitorSpeaker, Sparkles, Download } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { useState, useEffect, useRef } from "react";
import { buttonPressVariants } from "@/lib/animations";
import { useToastStore } from "@/store/toastStore";
import { MarqueeText } from "./MarqueeText";

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTime: number;
  duration: number;
  handleSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function FullScreenPlayer({ isOpen, onClose, audioRef, currentTime, duration, handleSeek }: FullScreenPlayerProps) {
  const { currentSong, isPlaying, pause, resume, playNext, playPrevious, isShuffle, toggleShuffle, isLoop, toggleLoop, favorites, toggleFavorite } = usePlayerStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close full screen on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!currentSong) return null;

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAction = (msg: string) => {
    useToastStore.getState().addToast(msg, "info");
    setIsMenuOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[100] bg-light-ivory dark:bg-bg-midnight text-text-dark dark:text-text-white flex flex-col overflow-hidden"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          {/* Blurred Background Image */}
          {currentSong.coverUrl && (
            <div 
              className="absolute inset-0 opacity-20 bg-cover bg-center blur-[100px] scale-150 pointer-events-none"
              style={{ backgroundImage: `url(${currentSong.coverUrl})` }}
            />
          )}

          {/* Top Bar (Mobile) / Close Button (Desktop) */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
             <button 
               onClick={onClose} 
               className="p-3 bg-light-pearl/80 dark:bg-white/5 hover:bg-light-silver dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center backdrop-blur-md border border-light-silver/50 dark:border-white/10 text-text-dark dark:text-white"
             >
               <ChevronDown size={24} />
             </button>
             <div className="hidden md:block bg-light-pearl/90 dark:bg-black/60 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-light-silver/50 dark:border-white/10 text-text-secondary dark:text-text-muted">
               To exit full screen, press and hold Esc
             </div>
          </div>

          <div className="flex-1 flex flex-col h-full max-w-7xl mx-auto w-full relative z-10">
            {/* Left/Top Area: Album Art & Controls */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 h-full w-full">
              
              {/* Album Art */}
              <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                 className="w-full max-w-[280px] sm:max-w-sm md:max-w-md aspect-square rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-2xl mb-8 relative bg-light-pearl dark:bg-surface-graphite ring-1 ring-light-silver dark:ring-white/10 flex-shrink-0"
              >
                {currentSong.coverUrl ? (
                  <img src={currentSong.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/5 dark:bg-black/40">
                     <span className="text-text-muted dark:text-white/30 text-2xl font-bold">No Cover</span>
                  </div>
                )}
              </motion.div>

              {/* Title & Artist */}
              <div className="w-full max-w-[280px] sm:max-w-sm md:max-w-md text-left mb-6 overflow-hidden flex flex-col min-w-0">
                <MarqueeText className="text-2xl md:text-4xl font-black text-text-dark dark:text-white leading-tight mb-1">
                  {currentSong.title}
                </MarqueeText>
                <MarqueeText className="text-sm md:text-base font-bold text-text-secondary dark:text-white/60 tracking-wider mb-1">
                  {[currentSong.singers, currentSong.musician].filter(Boolean).join(", ")} {currentSong.album ? `- ${currentSong.album}` : ""}
                </MarqueeText>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-[280px] sm:max-w-sm md:max-w-md mb-8">
                 <div className="flex justify-between text-xs text-text-secondary dark:text-white/50 font-mono mb-2">
                   <span>{formatTime(currentTime)}</span>
                   <span>{formatTime(duration || currentSong.duration || 0)}</span>
                 </div>
                 <div 
                    className="w-full h-2 bg-light-silver dark:bg-white/20 rounded-full relative overflow-hidden group cursor-pointer"
                    onClick={handleSeek}
                 >
                   <div 
                     className="absolute left-0 top-0 bottom-0 bg-text-dark dark:bg-white rounded-full group-hover:bg-primary transition-colors"
                     style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                   ></div>
                 </div>
              </div>

              {/* Controls */}
              <div className="w-full max-w-[280px] sm:max-w-sm md:max-w-md flex items-center justify-between">
                <div className="relative" ref={menuRef}>
                  <motion.button 
                    variants={buttonPressVariants} whileTap="tap"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-3 text-text-secondary hover:text-text-dark dark:text-white/60 dark:hover:text-white bg-light-pearl dark:bg-white/5 hover:bg-light-silver dark:hover:bg-white/10 rounded-full transition-colors"
                  >
                    <MoreHorizontal size={24} />
                  </motion.button>
                  
                  {/* Context Menu */}
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute bottom-full left-0 mb-4 w-56 bg-white dark:bg-black/90 backdrop-blur-xl border border-light-silver dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 text-sm font-medium text-text-dark dark:text-white"
                      >
                         <div className="px-4 py-2 text-xs font-bold text-text-muted dark:text-white/40 uppercase tracking-wider border-b border-light-silver/50 dark:border-white/5 mb-1">
                           Quick actions
                         </div>
                         <button onClick={() => handleAction("AI Suggestions coming soon!")} className="w-full text-left px-4 py-3 hover:bg-light-pearl dark:hover:bg-white/10 flex items-center justify-between transition-colors">
                           <span>AI suggestions</span> <Sparkles size={16} className="text-text-muted dark:text-white/40" />
                         </button>
                         <button onClick={() => handleAction("Downloading...")} className="w-full text-left px-4 py-3 hover:bg-light-pearl dark:hover:bg-white/10 flex items-center justify-between transition-colors">
                           <span>Download</span> <Download size={16} className="text-text-muted dark:text-white/40" />
                         </button>
                         <button onClick={() => handleAction("Add to playlist")} className="w-full text-left px-4 py-3 hover:bg-light-pearl dark:hover:bg-white/10 flex items-center justify-between transition-colors">
                           <span>Add to playlist</span> <ListPlus size={16} className="text-text-muted dark:text-white/40" />
                         </button>
                         <button onClick={() => {
                           toggleFavorite(currentSong.id);
                           handleAction(favorites.includes(currentSong.id) ? "Removed from Favorites" : "Added to Favorites");
                         }} className="w-full text-left px-4 py-3 hover:bg-light-pearl dark:hover:bg-white/10 flex items-center justify-between transition-colors">
                           <span className={favorites.includes(currentSong.id) ? "text-status-error font-bold" : ""}>
                             {favorites.includes(currentSong.id) ? "Remove from Favorites" : "Add to Favorites"}
                           </span> 
                           <Heart size={16} className={favorites.includes(currentSong.id) ? "text-status-error fill-current" : "text-text-muted dark:text-white/40"} />
                         </button>
                         <button onClick={() => { toggleLoop(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-light-pearl dark:hover:bg-white/10 flex items-center justify-between transition-colors">
                           <span className={isLoop ? "text-primary" : ""}>Enable loop</span> <Repeat size={16} className={isLoop ? "text-primary" : "text-text-muted dark:text-white/40"} />
                         </button>
                         <button onClick={() => handleAction("Sleep timer set")} className="w-full text-left px-4 py-3 hover:bg-light-pearl dark:hover:bg-white/10 flex items-center justify-between transition-colors">
                           <span>Sleep timer</span> <Moon size={16} className="text-text-muted dark:text-white/40" />
                         </button>
                         <button onClick={() => handleAction("Casting...")} className="w-full text-left px-4 py-3 hover:bg-light-pearl dark:hover:bg-white/10 flex items-center justify-between transition-colors">
                           <span>Cast to TV</span> <MonitorSpeaker size={16} className="text-text-muted dark:text-white/40" />
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  <motion.button variants={buttonPressVariants} whileTap="tap" onClick={playPrevious} className="text-text-dark dark:text-white/80 hover:text-primary dark:hover:text-white transition-colors">
                    <SkipBack size={32} fill="currentColor" />
                  </motion.button>
                  <motion.button 
                    variants={buttonPressVariants} whileTap="tap"
                    onClick={isPlaying ? pause : resume}
                    className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-primary text-text-white hover:scale-105 transition-transform shadow-[0_0_30px_rgba(var(--color-primary),0.3)]"
                  >
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                  </motion.button>
                  <motion.button variants={buttonPressVariants} whileTap="tap" onClick={playNext} className="text-text-dark dark:text-white/80 hover:text-primary dark:hover:text-white transition-colors">
                    <SkipForward size={32} fill="currentColor" />
                  </motion.button>
                </div>

                <motion.button 
                  variants={buttonPressVariants} whileTap="tap"
                  onClick={toggleShuffle}
                  className={`p-3 rounded-full transition-colors ${isShuffle ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-text-dark dark:text-white/60 dark:hover:text-white bg-light-pearl dark:bg-white/5 hover:bg-light-silver dark:hover:bg-white/10'}`}
                >
                  <Shuffle size={24} />
                </motion.button>
              </div>

            </div>
            
            {/* Right Area: Dummy Options Panel (Desktop only) */}
            <div className="hidden lg:flex w-80 xl:w-96 flex-col justify-center absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 z-20 opacity-0 animate-[fadeIn_1s_ease_0.5s_forwards]">
               <div className="mb-4">
                 <p className="text-xs font-bold text-text-muted dark:text-white/30 uppercase tracking-[0.2em]">Advertisements</p>
               </div>
               <div className="bg-white dark:bg-surface-graphite rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-light-silver dark:border-white/5">
                  <div className="bg-light-pearl dark:bg-surface-cocoa px-6 py-4 font-bold text-text-dark dark:text-text-white border-b border-light-silver dark:border-white/5">
                    Discover more
                  </div>
                  <button onClick={() => useToastStore.getState().addToast("Lyrics not available", "info")} className="w-full flex items-center justify-between px-6 py-4 text-text-dark dark:text-text-white hover:bg-light-pearl dark:hover:bg-white/5 transition-colors font-medium border-b border-light-silver dark:border-white/5">
                    Find Song Lyrics <ChevronDown size={16} className="-rotate-90 text-text-muted dark:text-white/40" />
                  </button>
                  <button onClick={() => useToastStore.getState().addToast("Feature coming soon", "info")} className="w-full flex items-center justify-between px-6 py-4 text-text-dark dark:text-text-white hover:bg-light-pearl dark:hover:bg-white/5 transition-colors font-medium border-b border-light-silver dark:border-white/5">
                    Stream Hindi Hits <ChevronDown size={16} className="-rotate-90 text-text-muted dark:text-white/40" />
                  </button>
                  <button onClick={() => useToastStore.getState().addToast("Feature coming soon", "info")} className="w-full flex items-center justify-between px-6 py-4 text-text-dark dark:text-text-white hover:bg-light-pearl dark:hover:bg-white/5 transition-colors font-medium">
                    Stream Desi Music <ChevronDown size={16} className="-rotate-90 text-text-muted dark:text-white/40" />
                  </button>
               </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
