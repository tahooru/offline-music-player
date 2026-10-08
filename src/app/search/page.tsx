"use client";

import { useState, useEffect } from "react";
import { db, Album, Entity } from "@/lib/db";
import { Song, usePlayerStore } from "@/store/playerStore";
import { Search, Play } from "lucide-react";
import { SongActionMenu } from "@/components/SongActionMenu";
import Link from "next/link";
import { motion } from "framer-motion";
import { pageTransitionVariants } from "@/lib/animations";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Entity[]>([]);
  
  const { playSong, addPlaylistToQueue } = usePlayerStore();

  useEffect(() => {
    async function loadAll() {
      const allSongs = await db.getAllSongs();
      const allAlbums = await db.getAllAlbums();
      const allArtists = await db.getAllEntities("singers");

      if (!query.trim()) {
         setSongs(allSongs.slice(0, 5));
         setAlbums(allAlbums.slice(0, 5));
         setArtists(allArtists.slice(0, 5));
         return;
      }

      const q = query.toLowerCase();
      setSongs(allSongs.filter(s => s.title.toLowerCase().includes(q) || s.singers?.toLowerCase().includes(q)));
      setAlbums(allAlbums.filter(a => a.name.toLowerCase().includes(q)));
      setArtists(allArtists.filter(a => a.name.toLowerCase().includes(q)));
    }
    loadAll();
  }, [query]);

  return (
    <motion.div 
      className="p-6 max-w-4xl mx-auto flex-1 flex flex-col gap-12 pb-32"
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageTransitionVariants}
    >
      <header className="mb-4 relative">
        <h1 className="text-hero-heading text-brand-dark dark:text-brand-light mb-6">Search</h1>
        <div className="relative">
          <Search size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search for songs, artists, or albums..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white dark:bg-surface-graphite border-2 border-transparent focus:border-primary rounded-2xl pl-12 pr-4 py-4 text-lg text-text-dark dark:text-text-white focus:outline-none shadow-sm transition-all"
          />
        </div>
      </header>

      {/* Songs Results */}
      <section id="songs" className="scroll-mt-6">
        <h2 className="text-section-heading text-text-dark dark:text-text-white">Songs</h2>
        <p className="text-metadata text-text-secondary dark:text-text-muted mt-1 mb-4">Matching tracks in your library</p>
        
        {songs.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-light-silver dark:border-surface-ash rounded-xl text-text-muted">No songs found</div>
        ) : (
          <div className="flex flex-col gap-2">
            {songs.map((song, index) => (
              <div 
                key={song.id} 
                onClick={() => { addPlaylistToQueue(songs, index); playSong(song); }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white dark:hover:bg-surface-graphite group cursor-pointer transition-colors border border-transparent hover:border-light-silver dark:hover:border-surface-ash shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-lg bg-light-silver dark:bg-surface-ash overflow-hidden flex-shrink-0 relative">
                  <img src={song.coverUrl || 'https://via.placeholder.com/48'} alt="" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  <Play size={20} className="absolute inset-0 m-auto text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-bold text-text-dark dark:text-text-white truncate group-hover:text-primary transition-colors">{song.title}</p>
                  <p className="text-xs text-text-secondary dark:text-text-muted truncate">{song.singers || "Unknown Artist"}</p>
                </div>
                <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <SongActionMenu song={song} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Albums Results */}
      <section id="albums" className="scroll-mt-6">
        <h2 className="text-section-heading text-text-dark dark:text-text-white">Albums</h2>
        <p className="text-metadata text-text-secondary dark:text-text-muted mt-1 mb-4">Matching collections</p>
        
        {albums.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-light-silver dark:border-surface-ash rounded-xl text-text-muted">No albums found</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
             {albums.map((album) => (
               <div key={album.id} className="bg-white dark:bg-surface-graphite p-4 rounded-xl border border-light-silver dark:border-surface-ash shadow-sm group">
                 <div className="aspect-square bg-light-silver dark:bg-surface-ash rounded-lg mb-3 overflow-hidden">
                    <img src={album.cover || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 </div>
                 <p className="font-bold text-text-dark dark:text-text-white truncate">{album.name}</p>
                 <p className="text-xs text-text-muted mt-1">{album.year}</p>
               </div>
             ))}
          </div>
        )}
      </section>

      {/* Artists Results */}
      <section id="artists" className="scroll-mt-6">
        <h2 className="text-section-heading text-text-dark dark:text-text-white">Artists</h2>
        <p className="text-metadata text-text-secondary dark:text-text-muted mt-1 mb-4">Matching profiles</p>
        
        {artists.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-light-silver dark:border-surface-ash rounded-xl text-text-muted">No artists found</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 -mx-2 px-2">
             {artists.map((artist) => (
                <Link href={`/artist/${artist.id}`} key={artist.id} className="flex-shrink-0 w-32 md:w-40 group cursor-pointer block">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-light-pearl dark:bg-surface-cocoa rounded-full mb-3 shadow-sm border-2 border-transparent group-hover:border-primary overflow-hidden relative transition-colors">
                     <img src={artist.photoUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80"} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <p className="text-album-title text-center truncate text-text-dark dark:text-text-white group-hover:text-primary transition-colors">{artist.name}</p>
                  <p className="text-artist-name text-center truncate text-text-secondary dark:text-text-muted text-sm mt-1">Artist</p>
                </Link>
             ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
