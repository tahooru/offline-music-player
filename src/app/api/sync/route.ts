import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary';
import { supabase } from '@/lib/supabase';

interface Catalog {
  songs: any[];
  albums: any[];
  entities: any[];
  languages: any[];
  updatedAt: number;
}

// In-memory cache for fast response times
let inMemoryCatalog: Catalog | null = null;

async function fetchFromCloudinary(): Promise<Catalog | null> {
  try {
    const cloudinary = getCloudinary();
    if (!process.env.CLOUDINARY_URL) return null;
    
    // Cloudinary raw URL for ttune_catalog
    const cloudName = cloudinary.config().cloud_name;
    if (!cloudName) return null;
    
    // Add cache buster timestamp
    const catalogUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/ttune_catalog.json?_t=${Date.now()}`;
    const res = await fetch(catalogUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return {
        songs: Array.isArray(data.songs) ? data.songs : [],
        albums: Array.isArray(data.albums) ? data.albums : [],
        entities: Array.isArray(data.entities) ? data.entities : [],
        languages: Array.isArray(data.languages) ? data.languages : [],
        updatedAt: data.updatedAt || Date.now()
      };
    }
  } catch (e) {
    console.warn("Could not fetch catalog from Cloudinary:", e);
  }
  return null;
}

async function saveToCloudinary(catalog: Catalog): Promise<boolean> {
  try {
    const cloudinary = getCloudinary();
    if (!process.env.CLOUDINARY_URL) return false;
    
    const buffer = Buffer.from(JSON.stringify(catalog, null, 2));
    await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          resource_type: 'raw', 
          public_id: 'ttune_catalog.json',
          overwrite: true,
          invalidate: true
        },
        (err, res) => err ? reject(err) : resolve(res)
      ).end(buffer);
    });
    return true;
  } catch (e) {
    console.warn("Could not save catalog to Cloudinary:", e);
    return false;
  }
}

export async function GET() {
  try {
    // 1. Fetch from Supabase
    let supaSongs: any[] = [];
    let supaAlbums: any[] = [];
    let supaEntities: any[] = [];
    let supaLanguages: any[] = [];

    try {
      const [{ data: songs }, { data: albums }, { data: entities }, { data: languages }] = await Promise.all([
        supabase.from('songs').select('*'),
        supabase.from('albums').select('*'),
        supabase.from('entities').select('*'),
        supabase.from('languages').select('*'),
      ]);
      if (songs) supaSongs = songs;
      if (albums) supaAlbums = albums;
      if (entities) supaEntities = entities;
      if (languages) supaLanguages = languages;
    } catch (supaErr) {
      console.warn("Supabase fetch warning:", supaErr);
    }

    // 2. Fetch from Cloudinary catalog
    const cloudCatalog = await fetchFromCloudinary();

    // 3. Merge Supabase & Cloudinary catalogs (by unique ID)
    const mergeById = (a: any[], b: any[]) => {
      const map = new Map();
      a.forEach(item => { if (item?.id) map.set(item.id, item); });
      b.forEach(item => { if (item?.id) map.set(item.id, { ...map.get(item.id), ...item }); });
      return Array.from(map.values());
    };

    const finalSongs = mergeById(cloudCatalog?.songs || [], supaSongs);
    const finalAlbums = mergeById(cloudCatalog?.albums || [], supaAlbums);
    const finalEntities = mergeById(cloudCatalog?.entities || [], supaEntities);
    const finalLanguages = mergeById(cloudCatalog?.languages || [], supaLanguages);

    inMemoryCatalog = {
      songs: finalSongs,
      albums: finalAlbums,
      entities: finalEntities,
      languages: finalLanguages,
      updatedAt: Date.now()
    };

    return NextResponse.json(inMemoryCatalog, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });

  } catch (error: any) {
    console.error("Sync GET Error:", error);
    return NextResponse.json({ 
      songs: [], albums: [], entities: [], languages: [], 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, item, type, fullCatalog } = body;

    // Load existing catalog
    let currentCatalog = inMemoryCatalog || (await fetchFromCloudinary()) || {
      songs: [], albums: [], entities: [], languages: [], updatedAt: Date.now()
    };

    if (fullCatalog) {
      currentCatalog = {
        songs: fullCatalog.songs || [],
        albums: fullCatalog.albums || [],
        entities: fullCatalog.entities || [],
        languages: fullCatalog.languages || [],
        updatedAt: Date.now()
      };
    } else if (action === 'save' && item && type) {
      if (type === 'song') {
        currentCatalog.songs = currentCatalog.songs.filter(s => s.id !== item.id).concat(item);
        // Also push to Supabase
        supabase.from('songs').upsert(item).then();
      } else if (type === 'album') {
        currentCatalog.albums = currentCatalog.albums.filter(a => a.id !== item.id).concat(item);
        supabase.from('albums').upsert(item).then();
      } else if (['singers', 'lyricists', 'musicians'].includes(type)) {
        currentCatalog.entities = currentCatalog.entities.filter(e => !(e.id === item.id && e.type === type)).concat({ ...item, type });
        supabase.from('entities').upsert({ ...item, type }).then();
      } else if (type === 'language') {
        currentCatalog.languages = currentCatalog.languages.filter(l => l.id !== item.id).concat(item);
        supabase.from('languages').upsert(item).then();
      }
    } else if (action === 'delete' && item?.id && type) {
      if (type === 'song') {
        currentCatalog.songs = currentCatalog.songs.filter(s => s.id !== item.id);
        supabase.from('songs').delete().eq('id', item.id).then();
      } else if (type === 'album') {
        currentCatalog.albums = currentCatalog.albums.filter(a => a.id !== item.id);
        supabase.from('albums').delete().eq('id', item.id).then();
      } else if (['singers', 'lyricists', 'musicians'].includes(type)) {
        currentCatalog.entities = currentCatalog.entities.filter(e => !(e.id === item.id && e.type === type));
        supabase.from('entities').delete().eq('id', item.id).eq('type', type).then();
      } else if (type === 'language') {
        currentCatalog.languages = currentCatalog.languages.filter(l => l.id !== item.id);
        supabase.from('languages').delete().eq('id', item.id).then();
      }
    }

    currentCatalog.updatedAt = Date.now();
    inMemoryCatalog = currentCatalog;

    // Save to Cloudinary in background
    await saveToCloudinary(currentCatalog);

    return NextResponse.json({ success: true, count: currentCatalog.songs.length });

  } catch (error: any) {
    console.error("Sync POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
