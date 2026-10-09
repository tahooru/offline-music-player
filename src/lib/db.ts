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
  songs: {
    key: string;
    value: Song;
    indexes: { 'by-title': string; 'by-singers': string };
  };
  albums: {
    key: string;
    value: Album;
  };
  singers: {
    key: string;
    value: Entity;
  };
  lyricists: {
    key: string;
    value: Entity;
  };
  musicians: {
    key: string;
    value: Entity;
  };
  languages: {
    key: string;
    value: Language;
  };
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

const UNIVERSAL_LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", 
  "Chinese (Mandarin)", "Japanese", "Korean", "Arabic", "Hindi", "Bengali", 
  "Punjabi", "Telugu", "Marathi", "Tamil", "Urdu", "Gujarati", "Kannada", 
  "Odia", "Malayalam", "Sindhi", "Nepali", "Sinhala", "Thai", "Vietnamese", 
  "Indonesian", "Malay", "Tagalog", "Swahili", "Yoruba", "Zulu", "Amharic", 
  "Turkish", "Persian", "Kurdish", "Dutch", "Polish", "Ukrainian", "Romanian", 
  "Greek", "Hungarian", "Czech", "Swedish", "Finnish", "Danish", "Norwegian", 
  "Hebrew"
].sort();

if (typeof window !== 'undefined') {
  dbPromise = openDB<MusicPlayerDB>('offline-music-player', 4, {
    upgrade(db, oldVersion, newVersion, transaction) {
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
  }).then(async (database) => {
    // Seed languages if the store is completely empty
    const tx = database.transaction('languages', 'readwrite');
    const store = tx.objectStore('languages');
    const count = await store.count();
    if (count === 0) {
      for (const lang of UNIVERSAL_LANGUAGES) {
        await store.put({ id: lang.toLowerCase().replace(/[^a-z]/g, ''), name: lang });
      }
    }
    return database;
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
    const database = await dbPromise;
    return database.getAll('songs');
  },
  async putSong(song: Song): Promise<void> {
    if (!dbPromise) return;
    const database = await dbPromise;
    await database.put('songs', song);
    notifyChange({ type: 'song', item: song });
    
    // Cloud Sync via /api/sync (Cloudinary + Supabase backend)
    if (typeof window !== 'undefined') {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', type: 'song', item: song })
      }).catch(err => console.warn("API sync song error:", err));

      supabase.from('songs').upsert({
        id: song.id,
        title: song.title,
        album: song.album,
        singers: song.singers,
        musician: song.musician,
        year: song.year,
        url: song.url,
        coverUrl: song.coverUrl,
        language: song.language,
        lyricist: song.lyricist
      }).then(({ error }) => { if (error) console.warn("Supabase sync notice:", error.message); });
    }
  },
  async deleteSong(id: string): Promise<void> {
    if (!dbPromise) return;
    const database = await dbPromise;
    await database.delete('songs', id);
    notifyChange({ type: 'song', id });

    if (typeof window !== 'undefined') {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', type: 'song', item: { id } })
      }).catch(err => console.warn("API delete song error:", err));

      supabase.from('songs').delete().eq('id', id).then();
    }
  },

  // --- Albums ---
  async getAllAlbums(): Promise<Album[]> {
    if (!dbPromise) return [];
    return (await dbPromise).getAll('albums');
  },
  async putAlbum(album: Album): Promise<void> {
    if (!dbPromise) return;
    await (await dbPromise).put('albums', album);
    notifyChange({ type: 'album', item: album });

    if (typeof window !== 'undefined') {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', type: 'album', item: album })
      }).catch(err => console.warn("API sync album error:", err));

      supabase.from('albums').upsert(album).then();
    }
  },
  async deleteAlbum(id: string): Promise<void> {
    if (!dbPromise) return;
    await (await dbPromise).delete('albums', id);
    notifyChange({ type: 'album', id });

    if (typeof window !== 'undefined') {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', type: 'album', item: { id } })
      }).catch(err => console.warn("API delete album error:", err));

      supabase.from('albums').delete().eq('id', id).then();
    }
  },

  // --- Entities (Generic) ---
  async getAllEntities(storeName: 'singers' | 'lyricists' | 'musicians'): Promise<Entity[]> {
    if (!dbPromise) return [];
    return (await dbPromise).getAll(storeName);
  },
  async putEntity(storeName: 'singers' | 'lyricists' | 'musicians', entity: Entity): Promise<void> {
    if (!dbPromise) return;
    await (await dbPromise).put(storeName, entity);
    notifyChange({ type: storeName, item: entity });

    if (typeof window !== 'undefined') {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', type: storeName, item: entity })
      }).catch(err => console.warn("API sync entity error:", err));

      supabase.from('entities').upsert({ ...entity, type: storeName }).then();
    }
  },
  async deleteEntity(storeName: 'singers' | 'lyricists' | 'musicians', id: string): Promise<void> {
    if (!dbPromise) return;
    await (await dbPromise).delete(storeName, id);
    notifyChange({ type: storeName, id });

    if (typeof window !== 'undefined') {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', type: storeName, item: { id } })
      }).catch(err => console.warn("API delete entity error:", err));

      supabase.from('entities').delete().eq('id', id).eq('type', storeName).then();
    }
  },

  // --- Languages ---
  async getAllLanguages(): Promise<Language[]> {
    if (!dbPromise) return [];
    return (await dbPromise).getAll('languages');
  },
  async putLanguage(language: Language): Promise<void> {
    if (!dbPromise) return;
    await (await dbPromise).put('languages', language);
    notifyChange({ type: 'language', item: language });

    if (typeof window !== 'undefined') {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', type: 'language', item: language })
      }).catch(err => console.warn("API sync language error:", err));

      supabase.from('languages').upsert(language).then();
    }
  },
  async deleteLanguage(id: string): Promise<void> {
    if (!dbPromise) return;
    await (await dbPromise).delete('languages', id);
    notifyChange({ type: 'language', id });

    if (typeof window !== 'undefined') {
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', type: 'language', item: { id } })
      }).catch(err => console.warn("API delete language error:", err));

      supabase.from('languages').delete().eq('id', id).then();
    }
  },

  // --- Playlists ---
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
    if (!dbPromise || typeof window === 'undefined') return;
    const database = await dbPromise;
    
    try {
      // 1. Fetch from our centralized API sync endpoint
      let hasCloudData = false;
      try {
        const res = await fetch('/api/sync', { cache: 'no-store' });
        if (res.ok) {
          const cloudData = await res.json();
          if (cloudData.songs && cloudData.songs.length > 0) {
            hasCloudData = true;
            const tx = database.transaction('songs', 'readwrite');
            for (const s of cloudData.songs) tx.store.put(s as Song);
            await tx.done;
          }
          if (cloudData.albums && cloudData.albums.length > 0) {
            const tx = database.transaction('albums', 'readwrite');
            for (const a of cloudData.albums) tx.store.put(a as Album);
            await tx.done;
          }
          if (cloudData.entities && cloudData.entities.length > 0) {
            const singersTx = database.transaction('singers', 'readwrite');
            const lyricistsTx = database.transaction('lyricists', 'readwrite');
            const musiciansTx = database.transaction('musicians', 'readwrite');
            for (const e of cloudData.entities) {
              if (e.type === 'singers') singersTx.store.put({ id: e.id, name: e.name, photoUrl: e.photoUrl });
              if (e.type === 'lyricists') lyricistsTx.store.put({ id: e.id, name: e.name, photoUrl: e.photoUrl });
              if (e.type === 'musicians') musiciansTx.store.put({ id: e.id, name: e.name, photoUrl: e.photoUrl });
            }
            await Promise.all([singersTx.done, lyricistsTx.done, musiciansTx.done]);
          }
          if (cloudData.languages && cloudData.languages.length > 0) {
            const tx = database.transaction('languages', 'readwrite');
            for (const l of cloudData.languages) tx.store.put(l as Language);
            await tx.done;
          }
        }
      } catch (apiErr) {
        console.warn("Direct API sync attempt notice:", apiErr);
      }

      // 2. Also query Supabase directly
      try {
        const [{ data: songs }, { data: albums }, { data: entities }, { data: languages }] = await Promise.all([
          supabase.from('songs').select('*'),
          supabase.from('albums').select('*'),
          supabase.from('entities').select('*'),
          supabase.from('languages').select('*'),
        ]);

        if (songs && songs.length > 0) {
          hasCloudData = true;
          const tx = database.transaction('songs', 'readwrite');
          for (const s of songs) tx.store.put(s as Song);
          await tx.done;
        }
        
        if (albums && albums.length > 0) {
          const tx = database.transaction('albums', 'readwrite');
          for (const a of albums) tx.store.put(a as Album);
          await tx.done;
        }

        if (entities && entities.length > 0) {
          const singersTx = database.transaction('singers', 'readwrite');
          const lyricistsTx = database.transaction('lyricists', 'readwrite');
          const musiciansTx = database.transaction('musicians', 'readwrite');
          for (const e of entities) {
            if (e.type === 'singers') singersTx.store.put({ id: e.id, name: e.name, photoUrl: e.photoUrl });
            if (e.type === 'lyricists') lyricistsTx.store.put({ id: e.id, name: e.name, photoUrl: e.photoUrl });
            if (e.type === 'musicians') musiciansTx.store.put({ id: e.id, name: e.name, photoUrl: e.photoUrl });
          }
          await Promise.all([singersTx.done, lyricistsTx.done, musiciansTx.done]);
        }

        if (languages && languages.length > 0) {
          const tx = database.transaction('languages', 'readwrite');
          for (const l of languages) tx.store.put(l as Language);
          await tx.done;
        }
      } catch (supaErr) {
        console.warn("Direct Supabase query notice:", supaErr);
      }

      // 3. If local database has songs that the cloud doesn't have, backfill to cloud
      const localSongs = await database.getAll('songs');
      if (localSongs.length > 0 && !hasCloudData) {
        const [localAlbums, localSingers, localLyricists, localMusicians, localLangs] = await Promise.all([
          database.getAll('albums'),
          database.getAll('singers'),
          database.getAll('lyricists'),
          database.getAll('musicians'),
          database.getAll('languages')
        ]);
        const allEntities = [
          ...localSingers.map(s => ({ ...s, type: 'singers' })),
          ...localLyricists.map(l => ({ ...l, type: 'lyricists' })),
          ...localMusicians.map(m => ({ ...m, type: 'musicians' })),
        ];

        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullCatalog: {
              songs: localSongs,
              albums: localAlbums,
              entities: allEntities,
              languages: localLangs
            }
          })
        }).catch(console.warn);
      }

      // 4. Notify UI that sync has completed and new data is ready
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('database-synced'));
        window.dispatchEvent(new CustomEvent('database-updated'));
      }
    } catch (e) {
      console.error("Failed to sync from cloud", e);
    }
  }
};
