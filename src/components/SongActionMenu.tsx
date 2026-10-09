"use client";

import { useState, useEffect } from "react";
import { MoreVertical, Heart, ListPlus, PlaySquare, PlusSquare, X, Info } from "lucide-react";
import { Song, usePlayerStore } from "@/store/playerStore";
import { useToastStore } from "@/store/toastStore";
import { db, Playlist } from "@/lib/db";
import { SongInfoModal } from "@/components/SongInfoModal";

export function SongActionMenu({ song, onChange }: { song: Song, onChange?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  
  const { insertNext, appendToQueue } = usePlayerStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    checkFavorite();
    if (isOpen) {
       loadPlaylists();
       window.history.pushState({ isActionMenuOpen: true }, "");
       const handlePopState = () => {
         setIsOpen(false);
         setShowPlaylists(false);
       };
       window.addEventListener("popstate", handlePopState);
       return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [isOpen]);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    setShowPlaylists(false);
    if (window.history.state?.isActionMenuOpen) {
      window.history.back();
    }
  };

  const checkFavorite = async () => {
    const favs = await db.getFavorites();
    setIsFavorite(favs.includes(song.id));
  };

  const loadPlaylists = async () => {
    setPlaylists(await db.getAllPlaylists());
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const favs = await db.getFavorites();
    if (isFavorite) {
       await db.saveFavorites(favs.filter(id => id !== song.id));
       addToast("Removed from favourites", "info");
    } else {
       await db.saveFavorites([...favs, song.id]);
       addToast("Added to favourites!", "success");
    }
    setIsFavorite(!isFavorite);
    handleClose();
    if (onChange) onChange();
  };

  const handlePlayNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    insertNext(song);
    addToast("Will play next", "info");
    handleClose();
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    appendToQueue(song);
    addToast("Added to queue", "info");
    handleClose();
  };

  const handleAddToPlaylist = async (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.songIds.includes(song.id)) {
       addToast("Song already in this playlist", "info");
    } else {
       await db.putPlaylist({ ...playlist, songIds: [...playlist.songIds, song.id] });
       addToast(`Added to ${playlist.name}`, "success");
    }
    handleClose();
    if (onChange) onChange();
  };

  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.stopPropagation(); if(isOpen) handleClose(); else { setIsOpen(true); setShowPlaylists(false); } }}
        className="w-10 h-10 rounded-full flex items-center justify-center text-text-muted hover:bg-light-silver dark:hover:bg-surface-ash transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-graphite border border-light-silver dark:border-surface-ash rounded-xl shadow-xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            
            {showPlaylists ? (
              <div>
                <div className="px-4 py-2 border-b border-light-silver dark:border-surface-ash flex items-center justify-between">
                   <span className="text-sm font-bold text-text-dark dark:text-text-white">Add to Playlist</span>
                   <button onClick={(e) => { e.stopPropagation(); setShowPlaylists(false); }} className="text-text-muted hover:text-text-dark dark:hover:text-text-white">
                      <X size={16} />
                   </button>
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                   {playlists.length === 0 ? (
                     <div className="px-4 py-4 text-xs text-text-muted text-center">No playlists found. Create one in Library.</div>
                   ) : (
                     playlists.map(pl => (
                       <button 
                         key={pl.id}
                         onClick={(e) => handleAddToPlaylist(pl, e)}
                         className="w-full text-left px-4 py-2.5 text-sm text-text-dark dark:text-text-white hover:bg-light-pearl dark:hover:bg-surface-cocoa transition-colors"
                       >
                         {pl.name}
                       </button>
                     ))
                   )}
                </div>
              </div>
            ) : (
              <>
                <button onClick={toggleFavorite} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-light-pearl dark:hover:bg-surface-cocoa transition-colors text-text-dark dark:text-text-white">
                  <Heart size={16} className={isFavorite ? "fill-primary text-primary" : "text-text-muted"} /> 
                  {isFavorite ? "Remove from Favourites" : "Save to Favourites"}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShowPlaylists(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-light-pearl dark:hover:bg-surface-cocoa transition-colors text-text-dark dark:text-text-white">
                  <ListPlus size={16} className="text-text-muted" /> Add to Playlist
                </button>
                <button onClick={handlePlayNext} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-light-pearl dark:hover:bg-surface-cocoa transition-colors text-text-dark dark:text-text-white">
                  <PlaySquare size={16} className="text-text-muted" /> Play Next
                </button>
                <button onClick={handleAddToQueue} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-light-pearl dark:hover:bg-surface-cocoa transition-colors text-text-dark dark:text-text-white">
                  <PlusSquare size={16} className="text-text-muted" /> Add to Queue
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShowInfo(true); handleClose(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-light-pearl dark:hover:bg-surface-cocoa transition-colors text-text-dark dark:text-text-white">
                  <Info size={16} className="text-text-muted" /> More Info
                </button>
              </>
            )}
          </div>
        </>
      )}

      {showInfo && (
        <SongInfoModal 
          isOpen={showInfo}
          onClose={() => setShowInfo(false)}
          song={song}
        />
      )}
    </div>
  );
}
