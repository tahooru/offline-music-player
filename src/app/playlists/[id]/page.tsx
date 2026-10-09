"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, Playlist } from "@/lib/db";
import { Song, usePlayerStore } from "@/store/playerStore";
import { Play, Shuffle, ArrowLeft, Disc, Music, Trash2, ListMusic } from "lucide-react";
import { motion } from "framer-motion";
import { pageTransitionVariants } from "@/lib/animations";
import { SongActionMenu } from "@/components/SongActionMenu";
import { useToastStore } from "@/store/toastStore";

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { playSong, addPlaylistToQueue } = usePlayerStore();
  const { addToast } = useToastStore();

  const loadData = async () => {
    if (!id) return;
    const found = await db.getPlaylist(id);
    if (!found) {
      setIsLoading(false);
      return;
    }
    setPlaylist(found);
    
    const allSongs = await db.getAllSongs();
    // Maintain playlist order
    const plSongs = found.songIds.map(sid => allSongs.find(s => s.id === sid)).filter(Boolean) as Song[];
    setSongs(plSongs);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted font-bold">Loading Playlist...</div>;
  }

  if (!playlist) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-status-error font-bold text-2xl">Playlist not found.</p>
        <button onClick={() => router.back()} className="text-primary hover:underline font-bold flex items-center gap-2">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    addPlaylistToQueue(songs, 0); 
    playSong(songs[0]);
  };

  const handleShuffle = () => {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    addPlaylistToQueue(shuffled, 0);
    playSong(shuffled[0]);
  };

  const removeSongFromPlaylist = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedIds = playlist.songIds.filter(id => id !== songId);
    await db.putPlaylist({ ...playlist, songIds: updatedIds });
    addToast("Song removed from playlist", "info");
    loadData();
  };

  return (
    <motion.div 
      className="p-6 md:p-10 max-w-5xl mx-auto pb-32"
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageTransitionVariants}
    >
      <button onClick={() => router.push('/library')} className="mb-8 text-text-muted hover:text-primary transition-colors flex items-center gap-2 font-bold text-sm">
        <ArrowLeft size={16} /> Back to Library
      </button>

      <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12 bg-white dark:bg-surface-graphite p-8 rounded-3xl border border-light-silver dark:border-surface-ash shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-xl border-4 border-light-silver dark:border-surface-ash bg-light-pearl dark:bg-surface-cocoa flex-shrink-0 relative group z-10 flex items-center justify-center">
          {songs.length > 0 && songs[0].coverUrl ? (
            <img 
              src={songs[0].coverUrl} 
              alt="Playlist Cover" 
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80"; }}
              className="w-full h-full object-cover"
            />
          ) : (
             <Disc size={64} className="text-text-muted opacity-50" />
          )}
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <div className="text-center md:text-left flex-1 z-10">
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-3 flex items-center justify-center md:justify-start gap-2">
             <ListMusic size={16} /> Custom Playlist
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-brand-dark dark:text-brand-light mb-6 tracking-tight line-clamp-2">
            {playlist.name}
          </h1>
          
          <div className="flex items-center justify-center md:justify-start gap-4">
            <button 
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="px-8 py-3.5 bg-primary text-text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-brand-dark hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 text-lg"
            >
              <Play fill="currentColor" size={20} /> Play
            </button>
            <button 
              onClick={handleShuffle}
              disabled={songs.length === 0}
              className="px-8 py-3.5 bg-light-pearl dark:bg-surface-cocoa border border-light-silver dark:border-surface-ash text-text-dark dark:text-text-white rounded-full font-bold shadow-sm hover:border-primary hover:text-primary transition-all disabled:opacity-50 flex items-center gap-2 text-lg"
            >
              <Shuffle size={20} /> Shuffle
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-text-dark dark:text-text-white flex items-center gap-2 border-b border-light-silver dark:border-surface-ash pb-4">
          <Music size={24} className="text-primary" /> Playlist Songs ({songs.length})
        </h2>
        
        {songs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-surface-graphite rounded-2xl border border-dashed border-light-silver dark:border-surface-ash">
             <p className="text-text-muted font-bold">This playlist is empty.</p>
             <p className="text-sm text-text-muted mt-2">Click the 3 dots on any song in your library to add it here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 bg-white dark:bg-surface-graphite p-4 rounded-2xl border border-light-silver dark:border-surface-ash shadow-sm">
            {songs.map((song, index) => (
              <div 
                key={song.id + index}
                onClick={() => {
                  addPlaylistToQueue(songs, index);
                  playSong(song);
                }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-light-pearl dark:hover:bg-surface-cocoa group cursor-pointer transition-colors border border-transparent hover:border-light-silver dark:hover:border-surface-ash"
              >
                <div className="w-8 text-center text-text-muted font-bold text-sm group-hover:text-primary">
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-lg bg-light-silver dark:bg-surface-ash overflow-hidden flex-shrink-0 relative">
                  <img 
                    src={song.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80'} 
                    alt={song.title} 
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80"; }}
                    className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" 
                  />
                  <Play size={20} className="absolute inset-0 m-auto text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-bold text-text-dark dark:text-text-white truncate group-hover:text-primary transition-colors">{song.title}</p>
                  <p className="text-xs text-text-secondary dark:text-text-muted truncate">{song.singers || "Unknown Artist"}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button 
                     onClick={(e) => removeSongFromPlaylist(song.id, e)}
                     className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:text-status-error hover:bg-status-error/10 transition-colors opacity-0 group-hover:opacity-100"
                     title="Remove from playlist"
                  >
                     <Trash2 size={16} />
                  </button>
                  <SongActionMenu song={song} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
