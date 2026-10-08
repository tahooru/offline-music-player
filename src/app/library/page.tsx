"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Heart, Disc, Play, Trash2 } from "lucide-react";
import { db, Playlist } from "@/lib/db";
import { Song, usePlayerStore } from "@/store/playerStore";
import { useToastStore } from "@/store/toastStore";
import { SongActionMenu } from "@/components/SongActionMenu";
import Link from "next/link";

export default function LibraryPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  
  const { playSong, addPlaylistToQueue } = usePlayerStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allPlaylists = await db.getAllPlaylists();
    setPlaylists(allPlaylists);

    const favIds = await db.getFavorites();
    const allSongs = await db.getAllSongs();
    setFavorites(allSongs.filter(s => favIds.includes(s.id)));
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substring(7),
      name: newPlaylistName.trim(),
      songIds: [],
      createdAt: Date.now()
    };
    
    await db.putPlaylist(newPlaylist);
    addToast("Playlist created successfully!", "success");
    setNewPlaylistName("");
    loadData();
  };

  const deletePlaylist = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await db.deletePlaylist(id);
    addToast("Playlist deleted", "info");
    loadData();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex-1 flex flex-col gap-12 pb-32">
      <header>
        <h1 className="text-hero-heading text-brand-dark dark:text-brand-light">Your Library</h1>
        <p className="text-body text-text-secondary dark:text-text-muted mt-2">All your saved music and playlists.</p>
      </header>

      <section id="create" className="scroll-mt-6">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="text-primary" />
          <h2 className="text-section-heading text-text-dark dark:text-text-white">Playlists</h2>
        </div>
        
        <form onSubmit={handleCreatePlaylist} className="flex gap-3 mb-6">
          <input 
            type="text" 
            placeholder="New Playlist Name..." 
            value={newPlaylistName}
            onChange={e => setNewPlaylistName(e.target.value)}
            className="flex-1 max-w-md bg-light-pearl dark:bg-surface-cocoa border border-light-silver dark:border-surface-ash rounded-xl px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" disabled={!newPlaylistName.trim()} className="px-6 py-3 bg-primary text-text-white font-bold rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 shadow-sm">
            Create
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {playlists.length === 0 ? (
            <div className="col-span-full py-8 text-center text-text-muted border border-dashed border-light-silver dark:border-surface-ash rounded-xl">
              No playlists created yet. Type a name above and hit Create!
            </div>
          ) : (
             playlists.map(pl => (
               <Link href={`/playlists/${pl.id}`} key={pl.id} className="bg-white dark:bg-surface-graphite p-4 rounded-xl border border-light-silver dark:border-surface-ash shadow-sm group hover:border-primary transition-colors cursor-pointer block">
                 <div className="aspect-square bg-light-silver dark:bg-surface-ash rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                   <Disc size={32} className="text-text-muted" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <button onClick={(e) => deletePlaylist(pl.id, e)} className="w-10 h-10 rounded-full bg-status-error text-white flex items-center justify-center hover:scale-110 transition-transform">
                       <Trash2 size={18} />
                     </button>
                   </div>
                 </div>
                 <p className="font-bold text-text-dark dark:text-text-white truncate group-hover:text-primary transition-colors">{pl.name}</p>
                 <p className="text-xs text-text-muted mt-1">{pl.songIds.length} songs</p>
               </Link>
             ))
          )}
        </div>
      </section>

      <section id="liked" className="scroll-mt-6">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="text-status-error fill-status-error" />
          <h2 className="text-section-heading text-text-dark dark:text-text-white">Favourite Songs</h2>
        </div>
        
        {favorites.length === 0 ? (
          <div className="flex-1 min-h-[200px] flex items-center justify-center border-2 border-dashed border-light-silver dark:border-surface-ash rounded-xl bg-light-pearl/30 dark:bg-surface-cocoa/30 p-6 text-center">
            <p className="text-text-muted text-body font-bold">You haven't liked any songs yet.<br/><span className="text-sm font-normal">Click the 3 dots on any song to save it!</span></p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 bg-white dark:bg-surface-graphite p-4 rounded-2xl border border-light-silver dark:border-surface-ash shadow-sm">
            {favorites.map((song, index) => (
              <div 
                key={song.id}
                onClick={() => {
                  addPlaylistToQueue(favorites, index);
                  playSong(song);
                }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-light-pearl dark:hover:bg-surface-cocoa group cursor-pointer transition-colors border border-transparent hover:border-light-silver dark:hover:border-surface-ash"
              >
                <div className="w-8 text-center text-text-muted font-bold text-sm group-hover:text-primary">
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-lg bg-light-silver dark:bg-surface-ash overflow-hidden flex-shrink-0 relative">
                  <img src={song.coverUrl || 'https://via.placeholder.com/48'} alt="" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  <Play size={20} className="absolute inset-0 m-auto text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-bold text-text-dark dark:text-text-white truncate group-hover:text-primary transition-colors">{song.title}</p>
                  <p className="text-xs text-text-secondary dark:text-text-muted truncate">{song.singers || "Unknown Artist"}</p>
                </div>
                <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <SongActionMenu song={song} onChange={loadData} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
