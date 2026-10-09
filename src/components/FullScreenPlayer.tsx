"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, MoreHorizontal, Play, Pause, SkipBack, SkipForward, 
  Repeat, Shuffle, Heart, ListPlus, Moon, MonitorSpeaker, Sparkles, 
  Download, Music, Info 
} from "lucide-react";
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
  onOpenInfo?: () => void;
  onTogglePlay?: () => void;
}

export function FullScreenPlayer({ 
  isOpen, 
  onClose, 
  audioRef, 
  currentTime, 
  duration, 
  handleSeek,
  onOpenInfo,
  onTogglePlay
}: FullScreenPlayerProps) {
  const { 
    currentSong, isPlaying, pause, resume, playNext, playPrevious, 
    isShuffle, toggleShuffle, isLoop, toggleLoop, favorites, toggleFavorite 
  } = usePlayerStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Reset img error on track change
  useEffect(() => {
    setImgError(false);
  }, [currentSong?.id]);

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

  // Close full screen on Esc and handle hardware back button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      window.history.pushState({ isFullScreenPlayerOpen: true }, "");
      const handlePopState = () => onClose();
      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isOpen, onClose]);

  const handleClose = () => {
    onClose();
    if (window.history.state?.isFullScreenPlayerOpen) {
      window.history.back();
    }
  };

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
          className="fixed top-0 left-0 right-0 bottom-[68px] md:bottom-0 z-40 bg-light-ivory dark:bg-bg-midnight text-text-dark dark:text-text-white flex flex-col justify-between overflow-hidden select-none"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          {/* Blurred Background Image */}
          {currentSong.coverUrl && !imgError && (
            <div 
              className="absolute inset-0 opacity-15 dark:opacity-20 bg-cover bg-center blur-[120px] scale-150 pointer-events-none"
              style={{ backgroundImage: `url(${currentSong.coverUrl})` }}
            />
          )}

          {/* Top Bar (Mobile & Desktop) */}
          <header className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 flex-shrink-0 relative z-20">
            <button 
              onClick={handleClose} 
              aria-label="Collapse player"
              className="p-2.5 bg-light-pearl/90 dark:bg-white/10 hover:bg-light-silver dark:hover:bg-white/20 rounded-full transition-colors flex items-center justify-center backdrop-blur-md border border-light-silver/50 dark:border-white/10 text-text-dark dark:text-white"
            >
              <ChevronDown size={22} />
            </button>
            
            <div className="flex flex-col items-center text-center px-2 min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-text-muted dark:text-white/40">
                Now Playing
              </span>
              {currentSong.album && (
                <span className="text-xs font-semibold text-text-secondary dark:text-white/70 truncate max-w-[200px] sm:max-w-xs">
                  {currentSong.album}
                </span>
              )}
            </div>

            {/* Top Right: Menu */}
            <div className="relative" ref={menuRef}>
              <motion.button 
                variants={buttonPressVariants} 
                whileTap="tap"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="More options"
                className="p-2.5 bg-light-pearl/90 dark:bg-white/10 hover:bg-light-silver dark:hover:bg-white/20 rounded-full transition-colors flex items-center justify-center backdrop-blur-md border border-light-silver/50 dark:border-white/10 text-text-dark dark:text-white"
              >
                <MoreHorizontal size={22} />
              </motion.button>
              
              {/* Context Menu Dropdown */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-black/90 backdrop-blur-xl border border-light-silver dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 text-sm font-medium text-text-dark dark:text-white"
                  >
                    <div className="px-4 py-2 text-xs font-bold text-text-muted dark:text-white/40 uppercase tracking-wider border-b border-light-silver/50 dark:border-white/5 mb-1">
                      Quick actions
                    </div>
                    {onOpenInfo && (
                      <button 
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenInfo();
                        }} 
                        className="w-full text-left px-4 py-3 hover:bg-light-pearl dark:hover:bg-white/10 flex items-center justify-between transition-colors"
                      >
                        <span>Song details & artists</span> <Info size={16} className="text-text-muted dark:text-white/40" />
                      </button>
                    )}
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
          </header>

          {/* Main Area */}
          <div className="flex-1 flex flex-col justify-around items-center px-4 sm:px-6 py-2 sm:py-3 w-full max-w-lg mx-auto relative z-10 min-h-0 overflow-y-auto custom-scrollbar">
            
            {/* Album Art (Scaled responsively to never push controls off screen) */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="w-[58vw] max-w-[210px] sm:max-w-[260px] md:max-w-[320px] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.15)] dark:shadow-2xl relative bg-light-pearl dark:bg-surface-graphite ring-1 ring-light-silver dark:ring-white/10 flex-shrink my-auto max-h-[34vh]"
            >
              {currentSong.coverUrl && !imgError ? (
                <img 
                  src={currentSong.coverUrl} 
                  alt={currentSong.title} 
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-light-pearl to-light-silver dark:from-surface-graphite dark:to-surface-cocoa">
                  <Music size={44} className="text-primary/70 mb-2" />
                  <span className="text-text-muted dark:text-white/40 text-xs font-bold uppercase tracking-wider">T-Tune</span>
                </div>
              )}
            </motion.div>

            {/* Title & Artist & Favorite Heart */}
            <div className="w-full max-w-[320px] sm:max-w-sm flex items-center justify-between gap-3 my-2 sm:my-3 flex-shrink-0 min-w-0">
              <div className="flex-1 min-w-0 overflow-hidden text-left">
                <MarqueeText className="text-xl sm:text-2xl md:text-3xl font-black text-text-dark dark:text-white leading-tight">
                  {currentSong.title}
                </MarqueeText>
                <MarqueeText className="text-xs sm:text-sm font-semibold text-text-secondary dark:text-white/60 tracking-wide mt-0.5">
                  {[currentSong.singers, currentSong.musician, currentSong.lyricist].filter(Boolean).join(", ")} {currentSong.album ? `- ${currentSong.album}` : ""}
                </MarqueeText>
              </div>

              <motion.button 
                variants={buttonPressVariants} 
                whileTap="tap"
                onClick={() => {
                  toggleFavorite(currentSong.id);
                  useToastStore.getState().addToast(favorites.includes(currentSong.id) ? "Removed from Favorites" : "Added to Favorites", "info");
                }}
                className={`p-2 rounded-full transition-colors flex-shrink-0 ${favorites.includes(currentSong.id) ? 'text-status-error bg-status-error/10' : 'text-text-secondary hover:text-text-dark dark:text-white/60 dark:hover:text-white'}`}
                title="Favorite"
              >
                <Heart size={22} fill={favorites.includes(currentSong.id) ? "currentColor" : "none"} />
              </motion.button>
            </div>

            {/* Progress Bar & Timestamps */}
            <div className="w-full max-w-[320px] sm:max-w-sm my-1.5 sm:my-2.5 flex-shrink-0">
              <div 
                className="w-full h-1.5 sm:h-2 bg-light-silver dark:bg-white/20 rounded-full relative overflow-hidden group cursor-pointer"
                onClick={handleSeek}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-primary rounded-full transition-colors"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] sm:text-xs text-text-secondary dark:text-white/50 font-mono mt-1.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || currentSong.duration || 0)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="w-full max-w-[320px] sm:max-w-sm flex items-center justify-between my-2 sm:my-3 flex-shrink-0">
              <motion.button 
                variants={buttonPressVariants} whileTap="tap"
                onClick={toggleShuffle}
                className={`p-2.5 rounded-full transition-colors ${isShuffle ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-text-dark dark:text-white/60 dark:hover:text-white'}`}
                title="Shuffle"
              >
                <Shuffle size={20} />
              </motion.button>

              <div className="flex items-center gap-4 sm:gap-6">
                <motion.button 
                  variants={buttonPressVariants} whileTap="tap" 
                  onClick={playPrevious} 
                  className="text-text-dark dark:text-white/80 hover:text-primary dark:hover:text-white transition-colors p-1"
                  title="Previous Track"
                >
                  <SkipBack size={28} fill="currentColor" />
                </motion.button>

                <motion.button 
                  variants={buttonPressVariants} whileTap="tap"
                  onClick={onTogglePlay || (isPlaying ? pause : resume)}
                  className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-primary text-text-white hover:scale-105 transition-transform shadow-[0_4px_20px_rgba(var(--color-primary),0.35)]"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-0.5" />}
                </motion.button>

                <motion.button 
                  variants={buttonPressVariants} whileTap="tap" 
                  onClick={playNext} 
                  className="text-text-dark dark:text-white/80 hover:text-primary dark:hover:text-white transition-colors p-1"
                  title="Next Track"
                >
                  <SkipForward size={28} fill="currentColor" />
                </motion.button>
              </div>

              <motion.button 
                variants={buttonPressVariants} whileTap="tap"
                onClick={toggleLoop}
                className={`p-2.5 rounded-full transition-colors ${isLoop ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-text-dark dark:text-white/60 dark:hover:text-white'}`}
                title="Repeat"
              >
                <Repeat size={20} />
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

        </motion.div>
      )}
    </AnimatePresence>
  );
}
