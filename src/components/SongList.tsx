"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { db } from "@/lib/db";
import { usePlayerStore, Song } from "@/store/playerStore";
import { listContainerVariants, listItemVariants } from "@/lib/animations";
import { SongActionMenu } from "@/components/SongActionMenu";

export function SongList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    async function loadSongs() {
      // In a real app this would fetch from Cloudinary/DB, for now we will load from IDB
      const storedSongs = await db.getAllSongs();
      setSongs(storedSongs);
    }
    loadSongs();
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
          onClick={() => playSong(song)}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-light-mist dark:hover:bg-surface-taupe transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 rounded bg-light-warm-grey dark:bg-surface-cocoa flex items-center justify-center text-text-muted group-hover:text-music-champagne overflow-hidden shadow-sm relative">
            {song.coverUrl ? (
               <img src={song.coverUrl} alt="cover" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
            ) : null}
            <Play size={20} className="absolute opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-track-title truncate text-text-dark dark:text-text-soft-white">{song.title}</p>
            <p className="text-artist-name truncate text-text-secondary dark:text-text-muted">{song.singers || "Unknown Artist"}</p>
          </div>
          <div className="flex-shrink-0">
             <SongActionMenu song={song} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
