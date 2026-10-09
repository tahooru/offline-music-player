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
  songs: { key: string; value: Song; indexes: { 'by-title': string; 'by-singers': string } };
  albums: { key: string; value: Album };
  singers: { key: string; value: Entity };
  lyricists: { key: string; value: Entity };
  musicians: { key: string; value: Entity };
  languages: { key: string; value: Language };
  playlists: { key: string; value: Playlist };
  user_data: { key: string; value: UserData };
}

let dbPromise: Promise<IDBPDatabase<MusicPlayerDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<MusicPlayerDB>('offline-music-player-v3', 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('songs')) {
        const store = db.createObjectStore('songs', { keyPath: 'id' });
        store.createIndex('by-title', 'title');
        store.createIndex('by-singers', 'singers');
      }
      if (!db.objectStoreNames.contains('albums')) db.createObjectStore('albums', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('singers')) db.createObjectStore('singers', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('lyricists')) db.createObjectStore('lyricists', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('musicians')) db.createObjectStore('musicians', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('languages')) db.createObjectStore('languages', { keyPath: 'id' });
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
    if (!dbPromise) return [];
    return (await dbPromise).getAll('songs');
  },
  async putSong(song: Song): Promise<void> {
    if (!dbPromise) return;
    // 1. Write to Cloud First
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
    if (error) console.error("Cloud upsert failed:", error);
    
    // 2. Update Local Cache
    await (await dbPromise).put('songs', song);
    notifyChange({ type: 'song', item: song });
  },
  async deleteSong(id: string): Promise<void> {
    if (!dbPromise) return;
    await supabase.from('songs').delete().eq('id', id);
    await (await dbPromise).delete('songs', id);
    notifyChange({ type: 'song', id });
  },

  // --- Albums ---
  async getAllAlbums(): Promise<Album[]> {
    if (!dbPromise) return [];
    return (await dbPromise).getAll('albums');
  },
  async putAlbum(album: Album): Promise<void> {
    if (!dbPromise) return;
    await supabase.from('albums').upsert(album);
    await (await dbPromise).put('albums', album);
    notifyChange({ type: 'album', item: album });
  },
  async deleteAlbum(id: string): Promise<void> {
    if (!dbPromise) return;
    await supabase.from('albums').delete().eq('id', id);
    await (await dbPromise).delete('albums', id);
    notifyChange({ type: 'album', id });
  },

  // --- Entities (Generic) ---
  async getAllEntities(storeName: 'singers' | 'lyricists' | 'musicians'): Promise<Entity[]> {
    if (!dbPromise) return [];
    return (await dbPromise).getAll(storeName);
  },
  async putEntity(storeName: 'singers' | 'lyricists' | 'musicians', entity: Entity): Promise<void> {
    if (!dbPromise) return;
    await supabase.from('entities').upsert({ ...entity, type: storeName });
    await (await dbPromise).put(storeName, entity);
    notifyChange({ type: storeName, item: entity });
  },
  async deleteEntity(storeName: 'singers' | 'lyricists' | 'musicians', id: string): Promise<void> {
    if (!dbPromise) return;
    await supabase.from('entities').delete().eq('id', id).eq('type', storeName);
    await (await dbPromise).delete(storeName, id);
    notifyChange({ type: storeName, id });
  },

  // --- Languages ---
  async getAllLanguages(): Promise<Language[]> {
    if (!dbPromise) return [];
    return (await dbPromise).getAll('languages');
  },
  async putLanguage(language: Language): Promise<void> {
    if (!dbPromise) return;
    await supabase.from('languages').upsert(language);
    await (await dbPromise).put('languages', language);
    notifyChange({ type: 'language', item: language });
  },
  async deleteLanguage(id: string): Promise<void> {
    if (!dbPromise) return;
    await supabase.from('languages').delete().eq('id', id);
    await (await dbPromise).delete('languages', id);
    notifyChange({ type: 'language', id });
  },

  // --- Playlists (Local Only) ---
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

  // --- User Data (Favorites - Local Only) ---
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

  // --- Cloud Sync Engine ---
  async syncFromCloud(): Promise<void> {
    if (!dbPromise || typeof window === 'undefined') return;
    const database = await dbPromise;
    
    try {
      // 1. Fetch entire catalog from Supabase
      const [{ data: songs }, { data: albums }, { data: entities }, { data: languages }] = await Promise.all([
        supabase.from('songs').select('*'),
        supabase.from('albums').select('*'),
        supabase.from('entities').select('*'),
        supabase.from('languages').select('*'),
      ]);

      let updated = false;

      // 2. Sync to local IndexedDB for instant offline access
      if (songs) {
        const tx = database.transaction('songs', 'readwrite');
        await tx.store.clear(); // Wipe local, trust cloud
        for (const s of songs) tx.store.put(s as Song);
        await tx.done;
        updated = true;
      }
      
      if (albums) {
        const tx = database.transaction('albums', 'readwrite');
        await tx.store.clear();
        for (const a of albums) tx.store.put(a as Album);
        await tx.done;
        updated = true;
      }

      if (entities) {
        const singersTx = database.transaction('singers', 'readwrite');
        const lyricistsTx = database.transaction('lyricists', 'readwrite');
        const musiciansTx = database.transaction('musicians', 'readwrite');
        await Promise.all([singersTx.store.clear(), lyricistsTx.store.clear(), musiciansTx.store.clear()]);
        
        for (const e of entities) {
          if (e.type === 'singers') singersTx.store.put({ id: e.id, name: e.name, photoUrl: e.photoUrl });
          if (e.type === 'lyricists') lyricistsTx.store.put({ id: e.id, name: e.name, photoUrl: e.photoUrl });
          if (e.type === 'musicians') musiciansTx.store.put({ id: e.id, name: e.name, photoUrl: e.photoUrl });
        }
        await Promise.all([singersTx.done, lyricistsTx.done, musiciansTx.done]);
        updated = true;
      }

      if (languages) {
        const tx = database.transaction('languages', 'readwrite');
        await tx.store.clear();
        for (const l of languages) tx.store.put(l as Language);
        await tx.done;
        updated = true;
      }

      if (updated) {
        window.dispatchEvent(new CustomEvent('database-synced'));
      }
    } catch (e) {
      console.warn("Offline Mode: Could not sync from cloud. Using local cached library.", e);
    }
  }
};
