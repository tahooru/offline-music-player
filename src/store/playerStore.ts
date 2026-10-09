import { create } from 'zustand';

export interface Song {
  id: string;
  title: string;
  album: string;
  year: string;
  singers: string;
  musician: string;
  url: string;
  coverUrl?: string;
  language?: string;
  lyricist?: string;
  duration?: number;
}

interface PlayerState {
  isPlaying: boolean;
  currentSong: Song | null;
  queue: Song[];
  isShuffle: boolean;
  isLoop: boolean;
  favorites: string[];
  isFullScreenOpen: boolean;
  
  setIsPlaying: (playing: boolean) => void;
  playSong: (song: Song, queue?: Song[]) => void;
  pause: () => void;
  resume: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setQueue: (queue: Song[]) => void;
  addPlaylistToQueue: (queue: Song[], startIndex: number) => void;
  insertNext: (song: Song) => void;
  appendToQueue: (song: Song) => void;
  toggleShuffle: () => void;
  toggleLoop: () => void;
  toggleFavorite: (songId: string) => void;
  setIsFullScreenOpen: (isOpen: boolean) => void;
  openFullScreen: () => void;
  closeFullScreen: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  currentSong: null,
  queue: [],
  isShuffle: false,
  isLoop: false,
  favorites: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('favorites') || '[]') : [],
  isFullScreenOpen: false,

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  playSong: (song, queue) => set((state) => ({ 
    currentSong: song, 
    isPlaying: true,
    queue: queue || (state.queue.length === 0 ? [song] : state.queue)
  })),
  
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  
  setQueue: (queue) => set({ queue }),
  
  addPlaylistToQueue: (queue, startIndex) => {
    set({ queue });
  },

  insertNext: (song) => set((state) => {
    if (!state.currentSong) return { queue: [song], currentSong: song, isPlaying: true };
    const idx = state.queue.findIndex(s => s.id === state.currentSong?.id);
    const newQueue = [...state.queue];
    newQueue.splice(idx >= 0 ? idx + 1 : 0, 0, song);
    return { queue: newQueue };
  }),

  appendToQueue: (song) => set((state) => {
    if (!state.currentSong) return { queue: [song], currentSong: song, isPlaying: true };
    return { queue: [...state.queue, song] };
  }),

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleLoop: () => set((state) => ({ isLoop: !state.isLoop })),
  
  toggleFavorite: (songId) => set((state) => {
    const isFav = state.favorites.includes(songId);
    const newFavs = isFav ? state.favorites.filter(id => id !== songId) : [...state.favorites, songId];
    if (typeof window !== 'undefined') localStorage.setItem('favorites', JSON.stringify(newFavs));
    return { favorites: newFavs };
  }),

  setIsFullScreenOpen: (isOpen) => set({ isFullScreenOpen: isOpen }),
  openFullScreen: () => set({ isFullScreenOpen: true }),
  closeFullScreen: () => set({ isFullScreenOpen: false }),

  playNext: () => {
    const { queue, currentSong, isShuffle, isLoop } = get();
    if (!currentSong || queue.length === 0) return;
    
    if (isShuffle) {
       const randomIndex = Math.floor(Math.random() * queue.length);
       set({ currentSong: queue[randomIndex], isPlaying: true });
       return;
    }

    const index = queue.findIndex(s => s.id === currentSong.id);
    if (index >= 0 && index < queue.length - 1) {
      set({ currentSong: queue[index + 1], isPlaying: true });
    } else if (isLoop && queue.length > 0) {
      set({ currentSong: queue[0], isPlaying: true });
    } else if (queue.length > 1) {
      // Wrap around queue
      set({ currentSong: queue[0], isPlaying: true });
    } else {
      set({ isPlaying: false });
    }
  },
  
  playPrevious: () => {
    const { queue, currentSong, isLoop } = get();
    if (!currentSong || queue.length === 0) return;
    const index = queue.findIndex(s => s.id === currentSong.id);
    if (index > 0) {
      set({ currentSong: queue[index - 1], isPlaying: true });
    } else if (isLoop && queue.length > 0) {
      set({ currentSong: queue[queue.length - 1], isPlaying: true });
    } else if (queue.length > 1) {
      // Wrap around to end
      set({ currentSong: queue[queue.length - 1], isPlaying: true });
    }
  }
}));
