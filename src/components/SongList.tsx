"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { db } from "@/lib/db";
import { usePlayerStore, Song } from "@/store/playerStore";
import { listContainerVariants, listItemVariants } from "@/lib/animations";
import { SongActionMenu } from "@/components/SongActionMenu";
import { MarqueeText } from "@/components/MarqueeText";

export function SongList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    async function loadSongs() {
      const storedSongs = await db.getAllSongs();
      setSongs(storedSongs);
    }
    loadSongs();

    const handleUpdate = () => { loadSongs(); };
    window.addEventListener('database-synced', handleUpdate);
    window.addEventListener('database-updated', handleUpdate);
    return () => {
      window.removeEventListener('database-synced', handleUpdate);
      window.removeEventListener('database-updated', handleUpdate);
    };
  }, []);

  if (songs.length === 0) {
    return (
      <div className="text-center py-10 text-text-muted">
        <p className="text-body">No offline songs available.</p>
        <p className="text-body text-sm mt-2">Upload some music via the admin panel.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col gap-2"
      variants={listContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {songs.map((song) => (
        <motion.div 
          key={song.id} 
          variants={listItemVariants}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => playSong(song, songs)}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-light-mist dark:hover:bg-surface-taupe transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 rounded bg-light-warm-grey dark:bg-surface-cocoa flex items-center justify-center text-text-muted group-hover:text-music-champagne overflow-hidden shadow-sm relative">
            {song.coverUrl ? (
               <img 
                 src={song.coverUrl} 
                 alt={song.title} 
                 onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80"; }}
                 className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" 
               />
            ) : null}
            <Play size={20} className="absolute opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <p className="text-track-title truncate text-text-dark dark:text-text-soft-white">{song.title}</p>
            <div className="w-full mt-0.5">
              <MarqueeText className="text-xs sm:text-sm font-semibold text-text-secondary dark:text-text-muted">
                {[song.singers, song.musician, song.lyricist].filter(Boolean).join(", ")} {song.album ? `- ${song.album}` : ""}
              </MarqueeText>
            </div>
          </div>
          <div className="flex-shrink-0">
             <SongActionMenu song={song} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
