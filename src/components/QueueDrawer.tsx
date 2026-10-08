"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "@/store/playerStore";
import { bottomSheetVariants, visualizerBarVariants } from "@/lib/animations";
import { X, Play, Music } from "lucide-react";
import { SongActionMenu } from "./SongActionMenu";

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QueueDrawer({ isOpen, onClose }: QueueDrawerProps) {
  const { queue, currentSong, playSong, isPlaying } = usePlayerStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />
          <motion.div
            variants={bottomSheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] h-full md:h-[600px] md:max-w-md md:left-auto md:right-4 md:bottom-24 bg-white dark:bg-surface-graphite rounded-t-3xl md:rounded-3xl shadow-2xl z-50 border border-light-silver dark:border-surface-ash flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-light-silver dark:border-surface-ash shrink-0">
              <h2 className="text-xl font-black text-text-dark dark:text-text-white flex items-center gap-2">
                 <Music size={20} className="text-primary" /> Playing Next
              </h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-light-silver dark:bg-surface-ash text-text-muted hover:text-text-dark dark:hover:text-text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2">
              {queue.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                
                return (
                  <div 
                    key={song.id + index}
                    onClick={() => playSong(song, queue)}
                    className={`flex items-center gap-4 p-3 rounded-xl group cursor-pointer transition-colors border ${isCurrent ? 'bg-primary/10 border-primary/20 dark:bg-primary/20 dark:border-primary/30' : 'border-transparent hover:bg-light-pearl dark:hover:bg-surface-cocoa hover:border-light-silver dark:hover:border-surface-ash'}`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-light-silver dark:bg-surface-ash overflow-hidden flex-shrink-0 relative">
                      <img src={song.coverUrl || 'https://via.placeholder.com/48'} alt="" className={`w-full h-full object-cover transition-opacity ${!isCurrent && 'group-hover:opacity-50'}`} />
                      
                      {isCurrent ? (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                           {[1, 2, 3].map(i => (
                              <motion.div 
                                key={i}
                                variants={visualizerBarVariants}
                                initial="initial"
                                animate={isPlaying ? "playing" : "paused"}
                                className="w-1 bg-white rounded-full"
                              />
                           ))}
                        </div>
                      ) : (
                        <Play size={20} className="absolute inset-0 m-auto text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-body font-bold truncate transition-colors ${isCurrent ? 'text-primary' : 'text-text-dark dark:text-text-white group-hover:text-primary'}`}>
                        {song.title}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-text-muted truncate">{song.singers || "Unknown Artist"}</p>
                    </div>
                    
                    <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <SongActionMenu song={song} />
                    </div>
                  </div>
                );
              })}
              
              {queue.length === 0 && (
                <div className="text-center py-12 text-text-muted">
                   <p className="font-bold">Queue is empty</p>
                   <p className="text-sm mt-1">Play a song or add tracks to your queue</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
