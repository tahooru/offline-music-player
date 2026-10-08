"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  buttonPressVariants,
  pageTransitionVariants
} from "@/lib/animations";
import { Search, Play } from "lucide-react";
import { SongList } from "@/components/SongList";
import { db, Entity, Album, Language } from "@/lib/db";
import { Song, usePlayerStore } from "@/store/playerStore";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <motion.div 
      className="flex flex-col min-h-screen bg-light-ivory dark:bg-bg-midnight text-text-dark dark:text-text-white font-sans transition-colors duration-1000"
      initial="initial"
      animate="enter"
      exit="exit"
      variants={pageTransitionVariants}
    >
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-light-silver dark:border-surface-ash">
        <h1 className="text-app-logo text-brand-dark dark:text-brand-light">
          T-Tune
        </h1>
        <div className="flex gap-4">
          <motion.button 
            variants={buttonPressVariants}
            initial="initial"
            whileTap="tap"
            onClick={() => router.push('/search')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-light-mist dark:bg-surface-graphite text-text-secondary dark:text-text-muted hover:bg-light-warm-grey dark:hover:bg-surface-taupe transition-colors"
          >
            <Search size={20} />
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-6">
        {/* Hero Section */}
        <section className="mb-10 p-8 rounded-2xl bg-gradient-to-br from-music-plum/20 to-music-mauve-glow/10 border border-light-silver dark:border-surface-ash relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-hero-heading text-brand-dark dark:text-brand-light mb-2">Welcome Back</h2>
            <p className="text-body text-text-secondary dark:text-text-muted max-w-md">
              Dive into your offline library. Your music, anytime, anywhere.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-20 opacity-20 pointer-events-none">
            <div className="w-64 h-64 rounded-full border-[20px] border-primary blur-3xl"></div>
          </div>
        </section>

        {/* Home Sections */}
        <div className="flex flex-col gap-12">
          
          <LanguageSection />
          
          <SongSection id="speed-list" title="Speed List" subtitle="Quick access to high energy tracks" limit={6} randomize />
          
          <section id="quick-picks" className="scroll-mt-6">
            <h2 className="text-section-heading text-text-dark dark:text-text-white mb-4">Quick Picks / Offline Library</h2>
            <div className="bg-white dark:bg-bg-charcoal rounded-xl p-4 shadow-sm border border-light-silver dark:border-surface-ash">
              <SongList />
            </div>
          </section>
          
          <SongSection id="suggested" title="Suggested For You" subtitle="Based on your library history" limit={8} />
          
          <AlbumSection />
          
          <ArtistSection />

        </div>
      </main>
    </motion.div>
  );
}

// --- Dynamic Database Powered Sections ---

function LanguageSection() {
  const [languages, setLanguages] = useState<Language[]>([]);
  
  useEffect(() => {
    Promise.all([db.getAllLanguages(), db.getAllSongs()]).then(([langs, songs]) => {
      const songLanguages = new Set(songs.map(s => s.language?.toLowerCase()).filter(Boolean));
      const activeLangs = langs.filter(l => songLanguages.has(l.name.toLowerCase()));
      
      // Show up to 8 random active languages
      const shuffled = [...activeLangs].sort(() => 0.5 - Math.random());
      setLanguages(shuffled.slice(0, 8));
    });
  }, []);

  if (languages.length === 0) return null;

  return (
    <section id="languages" className="scroll-mt-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-section-heading text-text-dark dark:text-text-white">Languages</h2>
          <p className="text-metadata text-text-secondary dark:text-text-muted mt-1">Sort your music by language</p>
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 -mx-2 px-2">
        {languages.map((lang, i) => {
           const gradients = [
             "from-blue-500 to-cyan-400", "from-purple-500 to-pink-500", 
             "from-orange-400 to-amber-400", "from-emerald-400 to-teal-400",
             "from-rose-400 to-red-500", "from-indigo-500 to-blue-600"
           ];
           const bg = gradients[i % gradients.length];
           return (
             <Link href="/search" key={lang.id} className="flex-shrink-0 w-32 md:w-40 group cursor-pointer relative overflow-hidden rounded-xl shadow-sm border border-light-silver dark:border-surface-ash aspect-video flex items-center justify-center transition-transform hover:scale-105">
               <div className={`absolute inset-0 bg-gradient-to-br ${bg} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
               <span className="relative z-10 text-white font-black tracking-wider text-sm md:text-lg shadow-sm">{lang.name}</span>
             </Link>
           );
        })}
      </div>
    </section>
  );
}

function SongSection({ id, title, subtitle, limit, randomize }: { id: string, title: string, subtitle: string, limit: number, randomize?: boolean }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const { playSong, addPlaylistToQueue } = usePlayerStore();

  useEffect(() => {
    db.getAllSongs().then(all => {
       if (randomize) {
         all = all.sort(() => 0.5 - Math.random());
       }
       setSongs(all.slice(0, limit));
    });
  }, [limit, randomize]);

  if (songs.length === 0) return null;

  return (
    <section id={id} className="scroll-mt-6">
      <div className="mb-4">
        <h2 className="text-section-heading text-text-dark dark:text-text-white">{title}</h2>
        <p className="text-metadata text-text-secondary dark:text-text-muted mt-1">{subtitle}</p>
      </div>
      <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 -mx-2 px-2">
        {songs.map((song, i) => (
          <div key={song.id} className="flex-shrink-0 w-32 md:w-40 group cursor-pointer" onClick={() => { addPlaylistToQueue(songs, i); playSong(song); }}>
            <div className="w-32 h-32 md:w-40 md:h-40 bg-light-pearl dark:bg-surface-cocoa rounded-xl mb-3 shadow-sm border border-light-silver dark:border-surface-ash overflow-hidden relative">
               <img src={song.coverUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80"} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                 <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                    <Play fill="currentColor" size={24} className="ml-1" />
                 </div>
               </div>
            </div>
            <p className="text-album-title truncate text-text-dark dark:text-text-white group-hover:text-primary transition-colors">{song.title}</p>
            <p className="text-artist-name truncate text-text-secondary dark:text-text-muted text-sm mt-1">{song.singers || "Unknown Artist"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AlbumSection() {
  const [albums, setAlbums] = useState<Album[]>([]);
  useEffect(() => {
    db.getAllAlbums().then(all => setAlbums(all));
  }, []);

  if (albums.length === 0) return null;

  return (
    <section id="featured" className="scroll-mt-6">
      <div className="mb-4">
        <h2 className="text-section-heading text-text-dark dark:text-text-white">Featured Albums</h2>
        <p className="text-metadata text-text-secondary dark:text-text-muted mt-1">Top offline selections from your library</p>
      </div>
      <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 -mx-2 px-2">
        {albums.map((album) => (
          <Link href="/search" key={album.id} className="flex-shrink-0 w-32 md:w-40 group cursor-pointer">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-light-pearl dark:bg-surface-cocoa rounded-xl mb-3 shadow-sm border border-light-silver dark:border-surface-ash overflow-hidden relative">
               <img src={album.cover || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80"} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300"></div>
            </div>
            <p className="text-album-title truncate text-text-dark dark:text-text-white group-hover:text-primary transition-colors">{album.name}</p>
            <p className="text-artist-name truncate text-text-secondary dark:text-text-muted text-sm mt-1">{album.year || "Album"}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ArtistSection() {
  const [artists, setArtists] = useState<Entity[]>([]);
  
  useEffect(() => {
    db.getAllEntities("singers").then(setArtists);
  }, []);

  if (artists.length === 0) return null;

  return (
    <section id="artists" className="scroll-mt-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-section-heading text-text-dark dark:text-text-white">Artists</h2>
          <p className="text-metadata text-text-secondary dark:text-text-muted mt-1">Browse your library by artist</p>
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 -mx-2 px-2">
        {artists.map((artist) => (
          <Link href={`/artist/${artist.id}`} key={artist.id} className="flex-shrink-0 w-32 md:w-40 group cursor-pointer">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-light-pearl dark:bg-surface-cocoa rounded-full mb-3 shadow-sm border-2 border-light-silver dark:border-surface-ash overflow-hidden relative group-hover:border-primary transition-colors">
               <img src={artist.photoUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80"} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300"></div>
            </div>
            <p className="text-album-title text-center truncate text-text-dark dark:text-text-white group-hover:text-primary transition-colors">{artist.name}</p>
            <p className="text-artist-name text-center truncate text-text-secondary dark:text-text-muted text-sm mt-1">Artist</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
