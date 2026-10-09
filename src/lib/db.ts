import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Song } from '@/store/playerStore';
import { supabase } from './supabase';

export interface Album {
  id: string;
  name: string;
  cover?: string;
  year?: string;
}

export interface Entity {
  id: string;
  name: string;
  photoUrl?: string;
  type?: string;
}

export interface Language {
  id: string;
  name: string;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  coverUrl?: string;
  createdAt: number;
}

export interface UserData {
  id: string;
  data: any;
}

interface MusicPlayerDB extends DBSchema {
  playlists: {
    key: string;
    value: Playlist;
  };
  user_data: {
    key: string;
    value: UserData;
  };
}

let dbPromise: Promise<IDBPDatabase<MusicPlayerDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<MusicPlayerDB>('offline-music-player-v2', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('playlists')) db.createObjectStore('playlists', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('user_data')) db.createObjectStore('user_data', { keyPath: 'id' });
    },
  });
}

function notifyChange(detail?: any) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('database-updated', { detail }));
  }
}

export const db = {
  // --- Songs ---
  async getAllSongs(): Promise<Song[]> {
    const { data, error } = await supabase.from('songs').select('*');
    if (error) {
      console.error('Error fetching songs from Supabase:', error);
      return [];
    }
    return data as Song[];
  },
  async putSong(song: Song): Promise<void> {
    const { error } = await supabase.from('songs').upsert({
      id: song.id,
      title: song.title,
      album: song.album,
      singers: song.singers,
      musician: song.musician,
      year: song.year,
      url: song.url,
      coverUrl: song.coverUrl,
      language: song.language,
      lyricist: song.lyricist,
      createdAt: song.createdAt || Date.now()
    });
    if (error) console.error("Error upserting song:", error);
    notifyChange({ type: 'song', item: song });
  },
  async deleteSong(id: string): Promise<void> {
    const { error } = await supabase.from('songs').delete().eq('id', id);
    if (error) console.error("Error deleting song:", error);
    notifyChange({ type: 'song', id });
  },

  // --- Albums ---
  async getAllAlbums(): Promise<Album[]> {
    const { data, error } = await supabase.from('albums').select('*');
    if (error) return [];
    return data as Album[];
  },
  async putAlbum(album: Album): Promise<void> {
    const { error } = await supabase.from('albums').upsert(album);
    if (error) console.error(error);
    notifyChange({ type: 'album', item: album });
  },
  async deleteAlbum(id: string): Promise<void> {
    await supabase.from('albums').delete().eq('id', id);
    notifyChange({ type: 'album', id });
  },

  // --- Entities (Generic) ---
  async getAllEntities(storeName: 'singers' | 'lyricists' | 'musicians'): Promise<Entity[]> {
    const { data, error } = await supabase.from('entities').select('*').eq('type', storeName);
    if (error) return [];
    return data as Entity[];
  },
  async putEntity(storeName: 'singers' | 'lyricists' | 'musicians', entity: Entity): Promise<void> {
    const { error } = await supabase.from('entities').upsert({ ...entity, type: storeName });
    if (error) console.error(error);
    notifyChange({ type: storeName, item: entity });
  },
  async deleteEntity(storeName: 'singers' | 'lyricists' | 'musicians', id: string): Promise<void> {
    await supabase.from('entities').delete().eq('id', id).eq('type', storeName);
    notifyChange({ type: storeName, id });
  },

  // --- Languages ---
  async getAllLanguages(): Promise<Language[]> {
    const { data, error } = await supabase.from('languages').select('*');
    if (error) return [];
    if (data.length === 0) {
      // Return defaults if none
      return [{ id: 'english', name: 'English' }, { id: 'hindi', name: 'Hindi' }, { id: 'tamil', name: 'Tamil' }];
    }
    return data as Language[];
  },
  async putLanguage(language: Language): Promise<void> {
    await supabase.from('languages').upsert(language);
    notifyChange({ type: 'language', item: language });
  },
  async deleteLanguage(id: string): Promise<void> {
    await supabase.from('languages').delete().eq('id', id);
    notifyChange({ type: 'language', id });
  },

  // --- Playlists (Local Storage) ---
  async getAllPlaylists(): Promise<Playlist[]> {
    if (!dbPromise) return [];
    return (await dbPromise).getAll('playlists');
  },
  async getPlaylist(id: string): Promise<Playlist | undefined> {
    if (!dbPromise) return undefined;
    return (await dbPromise).get('playlists', id);
  },
  async putPlaylist(playlist: Playlist): Promise<void> {
    if (!dbPromise) return;
    await (await dbPromise).put('playlists', playlist);
    notifyChange({ type: 'playlist', item: playlist });
  },
  async deletePlaylist(id: string): Promise<void> {
    if (!dbPromise) return;
    await (await dbPromise).delete('playlists', id);
    notifyChange({ type: 'playlist', id });
  },

  // --- User Data (Favorites) ---
  async getFavorites(): Promise<string[]> {
    if (!dbPromise) return [];
    const data = await (await dbPromise).get('user_data', 'favorites');
    return data ? data.data : [];
  },
  async saveFavorites(songIds: string[]): Promise<void> {
    if (!dbPromise) return;
    await (await dbPromise).put('user_data', { id: 'favorites', data: songIds });
    notifyChange({ type: 'favorites', songIds });
  },

  // --- Cloud Sync ---
  async syncFromCloud(): Promise<void> {
    // With direct Supabase integration, sync is basically notifying the UI to refetch.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('database-synced'));
    }
  }
};
