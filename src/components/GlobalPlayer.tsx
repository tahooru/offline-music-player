"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, ChevronUp, Mic2, Shuffle, Repeat, SkipBack, SkipForward, Heart, ListMusic, Maximize2, Volume2, VolumeX, Volume1 } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { buttonPressVariants, albumFloatVariants, trackChangeVariants } from "@/lib/animations";
import { QueueDrawer } from "./QueueDrawer";

export function GlobalPlayer() {
  const { currentSong, isPlaying, pause, resume, playNext, playPrevious, isShuffle, toggleShuffle, isLoop, toggleLoop } = usePlayerStore();
  const pathname = usePathname();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); // 0.0 to 1.0
  const [isMuted, setIsMuted] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback error", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
     if (audioRef.current) {
        audioRef.current.loop = isLoop;
     }
  }, [isLoop]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
    setCurrentTime(percent * duration);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong || pathname?.startsWith('/admin')) return null;

  return (
    <motion.footer 
      layoutId="mini-player"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-[68px] md:bottom-0 left-0 right-0 h-[64px] md:h-[90px] bg-light-pearl dark:bg-surface-cocoa border-t border-light-silver dark:border-surface-ash px-4 md:px-6 flex items-center justify-between z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
    >
      {/* LEFT: Cover & Info */}
      <div className="flex-1 md:flex-none md:w-1/3 overflow-hidden pr-4">
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={currentSong.id}
            variants={trackChangeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-3 w-full"
          >
            <motion.div 
               variants={albumFloatVariants}
               initial="initial"
               animate="animate"
               className="w-12 h-12 md:w-14 md:h-14 bg-music-lavender rounded-md shadow-sm overflow-hidden flex items-center justify-center text-text-white bg-music-vinyl ring-1 md:ring-2 ring-surface-taupe flex-shrink-0 relative"
            >
              {currentSong.coverUrl ? (
                <img src={currentSong.coverUrl} alt="cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-bg-midnight absolute z-10" />
              )}
            </motion.div>
            <div className="overflow-hidden flex flex-col justify-center">
              <p className="text-label text-text-secondary dark:text-text-muted truncate">{currentSong.singers}</p>
              <p className="text-track-title text-text-dark dark:text-text-white truncate -mt-0.5">{currentSong.title}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* MIDDLE: Controls (Desktop) */}
      <div className="hidden md:flex flex-col items-center justify-center group cursor-pointer gap-2 w-1/3">
        <div className="flex items-center justify-center gap-6 mb-1">
          <motion.button 
             variants={buttonPressVariants} initial="initial" whileTap="tap" 
             onClick={toggleShuffle}
             className={`${isShuffle ? 'text-primary' : 'text-text-muted hover:text-text-dark dark:hover:text-text-white'} transition-colors`}
          >
            <Shuffle size={18} />
          </motion.button>
          
          <motion.button 
            variants={buttonPressVariants} initial="initial" whileTap="tap"
            onClick={playPrevious}
            className="text-text-dark dark:text-text-white hover:text-primary transition-colors"
          >
            <SkipBack size={22} fill="currentColor" />
          </motion.button>
          
          <motion.button 
            variants={buttonPressVariants} initial="initial" whileTap="tap"
            onClick={isPlaying ? pause : resume}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-text-dark dark:bg-text-white text-white dark:text-bg-charcoal hover:scale-105 transition-transform shadow-md"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </motion.button>
          
          <motion.button 
            variants={buttonPressVariants} initial="initial" whileTap="tap"
            onClick={playNext}
            className="text-text-dark dark:text-text-white hover:text-primary transition-colors"
          >
            <SkipForward size={22} fill="currentColor" />
          </motion.button>
          
          <motion.button variants={buttonPressVariants} initial="initial" whileTap="tap" className="text-text-muted hover:text-text-dark dark:hover:text-text-white transition-colors">
            <Heart size={20} />
          </motion.button>
        </div>
        
        <div className="w-full max-w-md flex items-center gap-3">
          <span className="text-player-time text-text-secondary dark:text-text-muted">{formatTime(currentTime)}</span>
          <div 
             className="flex-1 h-1 bg-light-warm-grey dark:bg-surface-ash rounded-full relative overflow-hidden group-hover:h-1.5 transition-all cursor-pointer"
             onClick={handleSeek}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 bg-text-dark dark:bg-text-white rounded-full group-hover:bg-primary transition-colors"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
          <span className="text-player-time text-text-secondary dark:text-text-muted">
            {formatTime(duration || currentSong.duration || 0)}
          </span>
        </div>
      </div>
      
      {/* RIGHT: Extra Actions (Mobile vs Desktop) */}
      <div className="flex md:w-1/3 justify-end items-center gap-4 text-text-muted flex-shrink-0">
        
        {/* Mobile-only compact controls */}
        <div className="md:hidden flex items-center gap-3">
          <motion.button variants={buttonPressVariants} whileTap="tap" onClick={playPrevious}>
            <SkipBack size={20} className="text-text-dark dark:text-text-white" fill="currentColor" />
          </motion.button>
          <motion.button 
            variants={buttonPressVariants} initial="initial" whileTap="tap"
            onClick={isPlaying ? pause : resume}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-text-dark dark:bg-text-white text-white dark:text-bg-charcoal"
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </motion.button>
          <motion.button variants={buttonPressVariants} whileTap="tap" onClick={playNext}>
            <SkipForward size={20} className="text-text-dark dark:text-text-white" fill="currentColor" />
          </motion.button>
        </div>

        {/* Desktop-only secondary controls */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={toggleLoop} className={`transition-colors ${isLoop ? 'text-primary' : 'hover:text-text-dark dark:hover:text-text-white'}`} title="Loop">
             <Repeat size={18} />
          </button>
          <div className="group/vol flex items-center gap-2 relative">
             <button onClick={() => setIsMuted(!isMuted)} className="hover:text-text-dark dark:hover:text-text-white transition-colors">
               {isMuted || volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
             </button>
             <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-300 flex items-center">
                <input 
                  type="range" 
                  min="0" max="1" step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (parseFloat(e.target.value) > 0) setIsMuted(false);
                  }}
                  className="w-20 h-1.5 bg-light-silver dark:bg-surface-ash rounded-lg appearance-none cursor-pointer accent-primary"
                />
             </div>
          </div>
          <button title="Queue" onClick={() => setIsQueueOpen(!isQueueOpen)} className={`${isQueueOpen ? 'text-primary' : 'hover:text-text-dark dark:hover:text-text-white'} transition-colors`}>
             <ListMusic size={20} />
          </button>
          <button title="Full Screen Player">
             <Maximize2 size={18} className="hover:text-text-dark dark:hover:text-text-white cursor-pointer transition-colors" />
          </button>
        </div>
      </div>
      
      {/* Hidden actual audio player */}
      <audio 
        ref={audioRef}
        src={currentSong.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        onLoadedMetadata={handleTimeUpdate}
      />
      
      {/* Modals & Overlays */}
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </motion.footer>
  );
}
