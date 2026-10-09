"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, ArrowLeft, Plus, Music, UserCircle, Disc, Type, Mic2, Globe, Search, Filter, ArrowUpDown, LogOut, Activity, Clock, Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import { buttonPressVariants, pageTransitionVariants } from "@/lib/animations";
import { db, Album, Entity, Language } from "@/lib/db";
import { Song } from "@/store/playerStore";
import { SmartDropdown } from "@/components/SmartDropdown";
import { MediaUpload } from "@/components/MediaUpload";
import { CoverUpload } from "@/components/CoverUpload";
import { useToastStore } from "@/store/toastStore";

type Tab = "statistics" | "songs" | "albums" | "singers" | "lyricists" | "musicians" | "languages";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("statistics");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const authTime = sessionStorage.getItem("adminAuth");
    let timeoutId: NodeJS.Timeout;
    
    if (authTime) {
      const timeElapsed = Date.now() - parseInt(authTime);
      const TWO_HOURS = 2 * 60 * 60 * 1000;
      
      if (timeElapsed < TWO_HOURS) {
        setIsAuthenticated(true);
        // Automatically logout when the 2 hours expire while on the page
        timeoutId = setTimeout(() => {
           sessionStorage.removeItem("adminAuth");
           setIsAuthenticated(false);
           useToastStore.getState().addToast("Session expired. Please log in again.", "info");
        }, TWO_HOURS - timeElapsed);
      } else {
        sessionStorage.removeItem("adminAuth");
      }
    }
    setIsChecking(false);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, []);

  if (isChecking) return null; // Prevent hydration flash

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const confirmLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    setIsLogoutModalOpen(false);
    useToastStore.getState().addToast("You have been securely logged out.", "info");
  };

  return (
    <>
      <motion.div 
        className="flex min-h-screen bg-light-ivory dark:bg-bg-midnight text-text-dark dark:text-text-white transition-colors duration-1000"
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageTransitionVariants}
      >
        <aside className="w-64 bg-light-pearl dark:bg-surface-cocoa border-r border-light-silver dark:border-surface-ash flex-shrink-0 flex flex-col hidden md:flex">
          <div className="p-6 border-b border-light-silver dark:border-surface-ash">
            <Link href="/" className="flex items-center gap-3 group">
              <ArrowLeft size={20} className="text-text-muted group-hover:text-primary transition-colors" />
              <h1 className="text-section-heading text-brand-dark dark:text-brand-light">Admin Panel</h1>
            </Link>
          </div>
          <nav className="flex-1 p-4 flex flex-col gap-2">
            <TabButton active={activeTab === "statistics"} onClick={() => setActiveTab("statistics")} icon={<Activity size={18} />} label="Statistics" />
            <TabButton active={activeTab === "songs"} onClick={() => setActiveTab("songs")} icon={<Music size={18} />} label="Songs" />
            <TabButton active={activeTab === "albums"} onClick={() => setActiveTab("albums")} icon={<Disc size={18} />} label="Albums" />
            <TabButton active={activeTab === "singers"} onClick={() => setActiveTab("singers")} icon={<Mic2 size={18} />} label="Singers" />
            <TabButton active={activeTab === "lyricists"} onClick={() => setActiveTab("lyricists")} icon={<Type size={18} />} label="Lyricists" />
            <TabButton active={activeTab === "musicians"} onClick={() => setActiveTab("musicians")} icon={<UserCircle size={18} />} label="Musicians" />
            <TabButton active={activeTab === "languages"} onClick={() => setActiveTab("languages")} icon={<Globe size={18} />} label="Languages" />
          </nav>
          <div className="p-4 border-t border-light-silver dark:border-surface-ash">
            <button 
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-colors font-bold text-status-error hover:bg-status-error/10"
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-y-auto outline-none">
          <header className="md:hidden flex justify-between items-center p-4 border-b border-light-silver dark:border-surface-ash bg-white dark:bg-bg-charcoal sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <Link href="/"><ArrowLeft size={20} className="text-text-muted" /></Link>
              <h1 className="text-section-heading text-brand-dark dark:text-brand-light">Admin Panel</h1>
            </div>
            <button onClick={() => setIsLogoutModalOpen(true)} className="text-status-error p-2 bg-status-error/10 rounded-full hover:bg-status-error hover:text-white transition-colors">
              <LogOut size={18} />
            </button>
          </header>
        
        <div className="md:hidden flex overflow-x-auto p-4 gap-2 bg-light-pearl dark:bg-surface-cocoa border-b border-light-silver dark:border-surface-ash custom-scrollbar">
          <MobileTab active={activeTab === "statistics"} onClick={() => setActiveTab("statistics")} label="Statistics" />
          <MobileTab active={activeTab === "songs"} onClick={() => setActiveTab("songs")} label="Songs" />
          <MobileTab active={activeTab === "albums"} onClick={() => setActiveTab("albums")} label="Albums" />
          <MobileTab active={activeTab === "singers"} onClick={() => setActiveTab("singers")} label="Singers" />
          <MobileTab active={activeTab === "lyricists"} onClick={() => setActiveTab("lyricists")} label="Lyricists" />
          <MobileTab active={activeTab === "musicians"} onClick={() => setActiveTab("musicians")} label="Musicians" />
          <MobileTab active={activeTab === "languages"} onClick={() => setActiveTab("languages")} label="Languages" />
        </div>

        <div className="p-6 md:p-10 max-w-5xl w-full mx-auto pb-32">
          {activeTab === "statistics" && <StatisticsDashboard />}
          {activeTab === "songs" && <SongsManager />}
          {activeTab === "albums" && <AlbumsManager />}
          {activeTab === "singers" && <EntityManager title="Add Singer / Artist" entityName="singers" icon={<Mic2 size={20} className="text-primary" />} />}
          {activeTab === "lyricists" && <EntityManager title="Add Lyricist" entityName="lyricists" icon={<Type size={20} className="text-primary" />} />}
          {activeTab === "musicians" && <EntityManager title="Add Musician" entityName="musicians" icon={<UserCircle size={20} className="text-primary" />} />}
          {activeTab === "languages" && <LanguageForm />}
        </div>
      </main>
    </motion.div>
    
    <ConfirmModal 
      isOpen={isLogoutModalOpen}
      title="Secure Logout"
      message="Are you sure you want to log out of the Admin Panel? You will need to re-authenticate to access this dashboard again."
      confirmText="Yes, Log Out"
      onConfirm={confirmLogout}
      onCancel={() => setIsLogoutModalOpen(false)}
    />
    </>
  );
}

// --- Login Screen ---

function LoginScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState("");
  
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<"+" | "-" | "*">("+");
  
  useEffect(() => {
    generateCaptcha();
  }, []);
  
  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    const ops: ("+" | "-" | "*")[] = ["+", "-", "*"];
    setOperator(ops[Math.floor(Math.random() * ops.length)]);
    setCaptchaInput("");
  };
  
  const getExpectedAnswer = () => {
    if (operator === "+") return num1 + num2;
    if (operator === "-") return num1 - num2;
    if (operator === "*") return num1 * num2;
    return 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (username !== "Tahooru" || password !== "Tahooru@4268") {
      setError("Invalid username or password.");
      useToastStore.getState().addToast("Invalid admin credentials.", "error");
      return;
    }
    
    if (parseInt(captchaInput) !== getExpectedAnswer()) {
      setError("Incorrect CAPTCHA answer.");
      useToastStore.getState().addToast("Security check failed.", "error");
      generateCaptcha();
      return;
    }
    
    sessionStorage.setItem("adminAuth", Date.now().toString());
    useToastStore.getState().addToast("Login successful. Welcome back!", "success");
    onLoginSuccess();
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-light-ivory dark:bg-bg-midnight p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-md p-4 sm:p-8 flex flex-col relative overflow-hidden">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-8 gap-3">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Music size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black text-brand-dark dark:text-brand-light font-display tracking-tight text-center">
            T-Tune Admin
          </h1>
          <p className="text-body text-text-secondary dark:text-text-muted text-center">
            Secure Database Access
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-status-error/10 border border-status-error/20 rounded-xl text-status-error text-sm font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <Input 
            label="Username" 
            value={username} 
            onChange={setUsername} 
            autoFocus 
          />
          
          <div>
            <label className="block text-body text-text-dark dark:text-text-soft-white mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-light-pearl dark:bg-surface-cocoa border border-light-silver dark:border-surface-ash rounded-lg px-4 py-2.5 text-body text-text-dark dark:text-text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
            />
          </div>

          <div className="p-5 bg-light-mist dark:bg-bg-charcoal rounded-xl border border-light-silver dark:border-surface-ash">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-text-dark dark:text-text-soft-white">
                Security Check: Solve this
              </label>
              <button 
                type="button" 
                onClick={generateCaptcha} 
                className="text-text-muted hover:text-primary transition-colors flex items-center gap-1 text-xs font-bold"
                title="Refresh CAPTCHA"
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white dark:bg-surface-graphite border border-light-silver dark:border-surface-ash rounded-lg text-lg font-bold font-mono tracking-widest flex-shrink-0 text-text-dark dark:text-text-white">
                {num1} {operator} {num2} = ?
              </div>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                value={captchaInput} 
                onChange={(e) => setCaptchaInput(e.target.value)} 
                className="w-full bg-light-pearl dark:bg-surface-cocoa border border-light-silver dark:border-surface-ash rounded-lg px-4 py-2 text-body text-text-dark dark:text-text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all font-mono" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 mt-2 bg-primary text-text-white font-bold rounded-xl shadow-lg hover:bg-brand-dark transition-colors"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-light-silver dark:border-surface-ash text-center">
          <p className="text-xs font-bold text-text-muted">
            &copy; {new Date().getFullYear()} T-Tune. All rights reserved.
          </p>
        </div>

      </div>
    </motion.div>
  );
}

// --- Forms Components ---

function StatisticsDashboard() {
  const [counts, setCounts] = useState({ songs: 0, albums: 0, singers: 0 });
  const [stats, setStats] = useState({ visitors: 0, listeningSeconds: 0, downloads: 0 });

  useEffect(() => {
    const loadRealData = async () => {
      const [songs, albums, singers] = await Promise.all([
        db.getAllSongs(),
        db.getAllAlbums(),
        db.getAllEntities("singers")
      ]);
      setCounts({ songs: songs.length, albums: albums.length, singers: singers.length });
      
      // Load real client-side tracking data (defaulting to 0 since tracking isn't hooked up yet)
      const visitors = parseInt(localStorage.getItem("stats_visitors") || "0");
      const listeningSeconds = parseInt(localStorage.getItem("stats_listening_time") || "0");
      const downloads = parseInt(localStorage.getItem("stats_downloads") || "0");
      setStats({ visitors, listeningSeconds, downloads });
    };
    loadRealData();
  }, []);

  const formatListeningTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-section-heading mb-6 flex items-center gap-2 text-text-dark dark:text-text-white border-b border-light-silver dark:border-surface-ash pb-4">
        <Activity size={24} className="text-primary" /> Real-Time Statistics
      </h2>
      
      <h3 className="text-label text-text-secondary dark:text-text-muted mb-3 font-bold uppercase tracking-wider">Library Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-surface-graphite rounded-2xl p-6 border border-light-silver dark:border-surface-ash shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Music size={24} />
          </div>
          <div>
            <p className="text-body text-text-secondary dark:text-text-muted font-bold">Total Songs</p>
            <h3 className="text-3xl font-black text-text-dark dark:text-text-white">{counts.songs}</h3>
          </div>
        </div>
        
        <div className="bg-white dark:bg-surface-graphite rounded-2xl p-6 border border-light-silver dark:border-surface-ash shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-status-warning/10 text-status-warning rounded-xl flex items-center justify-center flex-shrink-0">
            <Disc size={24} />
          </div>
          <div>
            <p className="text-body text-text-secondary dark:text-text-muted font-bold">Total Albums</p>
            <h3 className="text-3xl font-black text-text-dark dark:text-text-white">{counts.albums}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-graphite rounded-2xl p-6 border border-light-silver dark:border-surface-ash shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-light/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Mic2 size={24} />
          </div>
          <div>
            <p className="text-body text-text-secondary dark:text-text-muted font-bold">Total Singers</p>
            <h3 className="text-3xl font-black text-text-dark dark:text-text-white">{counts.singers}</h3>
          </div>
        </div>
      </div>

      <h3 className="text-label text-text-secondary dark:text-text-muted mb-3 font-bold uppercase tracking-wider">Engagement Metrics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-surface-graphite rounded-2xl p-6 border border-light-silver dark:border-surface-ash shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-light-silver dark:bg-surface-ash text-text-dark dark:text-text-white rounded-xl flex items-center justify-center flex-shrink-0">
            <UserCircle size={24} />
          </div>
          <div>
            <p className="text-body text-text-secondary dark:text-text-muted font-bold">Total Visitors</p>
            <h3 className="text-2xl font-black text-text-dark dark:text-text-white">{stats.visitors}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-graphite rounded-2xl p-6 border border-light-silver dark:border-surface-ash shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-light-silver dark:bg-surface-ash text-text-dark dark:text-text-white rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-body text-text-secondary dark:text-text-muted font-bold">Listening Time</p>
            <h3 className="text-2xl font-black text-text-dark dark:text-text-white">{formatListeningTime(stats.listeningSeconds)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-graphite rounded-2xl p-6 border border-light-silver dark:border-surface-ash shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-light-silver dark:bg-surface-ash text-text-dark dark:text-text-white rounded-xl flex items-center justify-center flex-shrink-0">
            <Download size={24} />
          </div>
          <div>
            <p className="text-body text-text-secondary dark:text-text-muted font-bold">Downloads</p>
            <h3 className="text-2xl font-black text-text-dark dark:text-text-white">{stats.downloads}</h3>
          </div>
        </div>
      
      </div>
    </div>
  );
}

function SongsManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [formData, setFormData] = useState<Partial<Song>>({});

  useEffect(() => { loadSongs(); }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAdding) {
        setIsAdding(false);
        setFormData({});
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isAdding]);

  const loadSongs = async () => setSongs(await db.getAllSongs());

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.title) {
       useToastStore.getState().addToast("Song Name is required!", "error");
       return;
    }
    const isUpdating = !!formData.id;
    const songCover = (formData.coverUrl || "").trim();

    const newSong: Song = {
      id: formData.id || Math.random().toString(36).substring(7),
      title: formData.title || "",
      album: formData.album || "",
      singers: formData.singers || "",
      musician: formData.musician || "",
      year: formData.year || "",
      url: formData.url || "https://res.cloudinary.com/kjbnwmxk/video/upload/v1791523494/ttune_audio/default_track.mp3",
      coverUrl: songCover,
      language: formData.language || "",
      lyricist: formData.lyricist || "",
    };
    await db.putSong(newSong);

    // Automatically propagate cover photo to Album if album has no cover
    if (formData.album) {
      try {
        const allAlbums = await db.getAllAlbums();
        const existingAlbum = allAlbums.find(a => a.name.toLowerCase() === formData.album!.toLowerCase());
        if (existingAlbum) {
          if (!existingAlbum.cover && songCover) {
            await db.putAlbum({ ...existingAlbum, cover: songCover });
          }
        } else {
          await db.putAlbum({
            id: Math.random().toString(36).substring(7),
            name: formData.album,
            cover: songCover,
            year: formData.year || ""
          });
        }
      } catch (err) {
        console.warn("Album cover sync notice:", err);
      }
    }

    // Automatically propagate cover photo to Singer(s) if singer has no photo
    if (formData.singers && songCover) {
      try {
        const singerNames = formData.singers.split(",").map(s => s.trim()).filter(Boolean);
        const allSingers = await db.getAllEntities("singers");
        for (const sName of singerNames) {
          const matchedSinger = allSingers.find(s => s.name.toLowerCase() === sName.toLowerCase());
          if (matchedSinger && !matchedSinger.photoUrl) {
            await db.putEntity("singers", { ...matchedSinger, photoUrl: songCover });
          } else if (!matchedSinger) {
            await db.putEntity("singers", {
              id: Math.random().toString(36).substring(7),
              name: sName,
              photoUrl: songCover
            });
          }
        }
      } catch (err) {
        console.warn("Singer photo sync notice:", err);
      }
    }

    // Automatically propagate cover photo to Musician (Composer) if composer has no photo
    if (formData.musician && songCover) {
      try {
        const musicianNames = formData.musician.split(",").map(m => m.trim()).filter(Boolean);
        const allMusicians = await db.getAllEntities("musicians");
        for (const mName of musicianNames) {
          const matchedMusician = allMusicians.find(m => m.name.toLowerCase() === mName.toLowerCase());
          if (matchedMusician && !matchedMusician.photoUrl) {
            await db.putEntity("musicians", { ...matchedMusician, photoUrl: songCover });
          } else if (!matchedMusician) {
            await db.putEntity("musicians", {
              id: Math.random().toString(36).substring(7),
              name: mName,
              photoUrl: songCover
            });
          }
        }
      } catch (err) {
        console.warn("Musician photo sync notice:", err);
      }
    }

    setFormData({});
    setIsAdding(false);
    loadSongs();
    useToastStore.getState().addToast(isUpdating ? "Song updated successfully" : "New song added successfully", "success");
  };

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if(itemToDelete) {
      await db.deleteSong(itemToDelete);
      loadSongs();
      setItemToDelete(null);
      useToastStore.getState().addToast("Song deleted", "success");
    }
  };

  const handleEdit = (song: Song) => {
    setFormData(song);
    setIsAdding(true);
  };

  if (isAdding) {
    return (
      <section className="bg-white dark:bg-surface-graphite rounded-2xl p-6 md:p-8 border border-light-silver dark:border-surface-ash shadow-sm relative">
        <button onClick={() => { setIsAdding(false); setFormData({}); }} className="absolute top-6 right-6 md:top-8 md:right-8 text-text-muted hover:text-text-dark dark:hover:text-text-white transition-colors flex items-center gap-2 text-sm font-bold">
          <ArrowLeft size={16} /> Back to List (Esc)
        </button>
        
        <h2 className="text-section-heading mb-6 flex items-center gap-2 text-text-dark dark:text-text-white border-b border-light-silver dark:border-surface-ash pb-4">
          <Plus size={20} className="text-primary" /> {formData.id ? "Edit Song" : "Add New Song"}
        </h2>
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-4">
            <div className="space-y-4">
              <Input label="Song Name *" value={formData.title || ''} onChange={v => setFormData({...formData, title: v})} placeholder="e.g. Shape of You" autoFocus />
              <SmartDropdown 
                label="Album" 
                value={formData.album || ''} 
                onChange={async (v) => {
                  const updated = { ...formData, album: v };
                  // If current song has no cover, inherit from selected album!
                  if (!formData.coverUrl && v) {
                    const albums = await db.getAllAlbums();
                    const matched = albums.find(a => a.name.toLowerCase() === v.toLowerCase());
                    if (matched?.cover) {
                      updated.coverUrl = matched.cover;
                      useToastStore.getState().addToast(`Inherited cover from album "${matched.name}"`, "info");
                    }
                  }
                  setFormData(updated);
                }} 
                placeholder="Select Album..." 
                fetchOptions={async () => (await db.getAllAlbums()).map(a => a.name)}
                onCreateNew={async (name) => { await db.putAlbum({ id: Math.random().toString(36).substring(7), name, cover: formData.coverUrl || "", year: formData.year || "" }) }}
              />
              <SmartDropdown 
                label="Singer(s) (Artists)" 
                value={formData.singers || ''} 
                onChange={v => setFormData({...formData, singers: v})} 
                placeholder="Select Singer..." 
                fetchOptions={async () => (await db.getAllEntities("singers")).map(s => s.name)}
                onCreateNew={async (name) => { await db.putEntity("singers", { id: Math.random().toString(36).substring(7), name, photoUrl: formData.coverUrl || "" }) }}
                multiSelect={true}
              />
              <SmartDropdown 
                label="Language" 
                value={formData.language || ''} 
                onChange={v => setFormData({...formData, language: v})} 
                placeholder="Select Language..." 
                fetchOptions={async () => (await db.getAllLanguages()).map(l => l.name)}
                onCreateNew={async (name) => { await db.putLanguage({ id: Math.random().toString(36).substring(7), name }) }}
              />
            </div>
            <div className="space-y-4">
              <SmartDropdown 
                label="Music (Composer)" 
                value={formData.musician || ''} 
                onChange={v => setFormData({...formData, musician: v})} 
                placeholder="Select Composer..." 
                fetchOptions={async () => (await db.getAllEntities("musicians")).map(m => m.name)}
                onCreateNew={async (name) => { await db.putEntity("musicians", { id: Math.random().toString(36).substring(7), name, photoUrl: formData.coverUrl || "" }) }}
                multiSelect={true}
              />
              <SmartDropdown 
                label="Lyrics (Lyricist)" 
                value={formData.lyricist || ''} 
                onChange={v => setFormData({...formData, lyricist: v})} 
                placeholder="Select Lyricist..." 
                fetchOptions={async () => (await db.getAllEntities("lyricists")).map(l => l.name)}
                onCreateNew={async (name) => { await db.putEntity("lyricists", { id: Math.random().toString(36).substring(7), name, photoUrl: formData.coverUrl || "" }) }}
                multiSelect={true}
              />
              <CoverUpload 
                label="Cover Photo (Download from link or upload file)" 
                value={formData.coverUrl || ''} 
                onChange={v => setFormData({...formData, coverUrl: v})} 
                placeholder="Paste direct image, Spotify, YouTube or web link..."
              />
              <Input label="Year" value={formData.year || ''} onChange={v => setFormData({...formData, year: v})} placeholder="2023" />
            </div>
            <MediaUpload url={formData.url} onUrlChange={v => setFormData({...formData, url: v})} />
          </div>
          <button type="submit" className="px-6 py-3 rounded-full bg-primary text-text-white font-bold hover:bg-brand-dark transition-colors">
            {formData.id ? "Update Song" : "Save Song"} (Enter)
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-surface-graphite rounded-2xl p-6 md:p-8 border border-light-silver dark:border-surface-ash shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-light-silver dark:border-surface-ash pb-4">
        <h2 className="text-section-heading flex items-center gap-2 text-text-dark dark:text-text-white"><Music size={20} className="text-primary" /> Manage Songs</h2>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-text-white rounded-lg text-sm font-bold hover:bg-brand-dark transition-colors"><Plus size={16} /> Add a New Song</button>
      </div>

      <Toolbar />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-light-silver dark:border-surface-ash text-label text-text-secondary dark:text-text-muted">
              <th className="py-3 px-4 font-bold">Song Name</th>
              <th className="py-3 px-4 font-bold hidden md:table-cell">Album</th>
              <th className="py-3 px-4 font-bold hidden sm:table-cell">Singers</th>
              <th className="py-3 px-4 font-bold hidden lg:table-cell">Language</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr 
                key={song.id} 
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Delete") setItemToDelete(song.id);
                  if (e.key === "F2") handleEdit(song);
                }}
                className="border-b border-light-silver dark:border-surface-ash hover:bg-light-pearl dark:hover:bg-surface-cocoa focus:bg-light-pearl dark:focus:bg-surface-cocoa outline-none transition-colors group cursor-pointer"
                title="Select row and press F2 to Edit, Delete to Remove"
              >
                <td className="py-3 px-4 text-body text-text-dark dark:text-text-white font-bold">{song.title}</td>
                <td className="py-3 px-4 text-body text-text-secondary dark:text-text-muted hidden md:table-cell">{song.album}</td>
                <td className="py-3 px-4 text-body text-text-secondary dark:text-text-muted hidden sm:table-cell">{song.singers}</td>
                <td className="py-3 px-4 text-body text-text-secondary dark:text-text-muted hidden lg:table-cell">{song.language}</td>
                <td className="py-3 px-4 text-right space-x-3">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(song); }} className="text-primary hover:text-brand-dark transition-colors text-sm font-bold">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); setItemToDelete(song.id); }} className="text-status-error hover:text-red-700 transition-colors text-sm font-bold">Delete</button>
                </td>
              </tr>
            ))}
            {songs.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-text-muted">No songs added yet.</td></tr>}
          </tbody>
        </table>
      </div>
      
      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Delete Song"
        message="Are you sure you want to delete this song? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </section>
  );
}

function AlbumsManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [formData, setFormData] = useState<Partial<Album>>({});

  useEffect(() => { loadAlbums(); }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAdding) {
        setIsAdding(false);
        setFormData({});
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isAdding]);

  const loadAlbums = async () => setAlbums(await db.getAllAlbums());

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.name) {
      useToastStore.getState().addToast("Album Name is required!", "error");
      return;
    }
    const isUpdating = !!formData.id;
    const albumCover = (formData.cover || "").trim();

    await db.putAlbum({
      id: formData.id || Math.random().toString(36).substring(7),
      name: formData.name,
      cover: albumCover,
      year: formData.year || "",
    });

    // If album has a cover, backfill any songs in this album that lack a cover
    if (albumCover) {
      try {
        const allSongs = await db.getAllSongs();
        for (const s of allSongs) {
          if (s.album?.toLowerCase() === formData.name.toLowerCase() && !s.coverUrl) {
            await db.putSong({ ...s, coverUrl: albumCover });
          }
        }
      } catch (err) {
        console.warn("Song backfill error:", err);
      }
    }

    setFormData({});
    setIsAdding(false);
    loadAlbums();
    useToastStore.getState().addToast(isUpdating ? "Album updated successfully" : "New album added successfully", "success");
  };

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if(itemToDelete) {
      await db.deleteAlbum(itemToDelete);
      loadAlbums();
      setItemToDelete(null);
      useToastStore.getState().addToast("Album deleted", "success");
    }
  };

  const handleEdit = (album: Album) => {
    setFormData(album);
    setIsAdding(true);
  };

  if (isAdding) {
    return (
      <section className="bg-white dark:bg-surface-graphite rounded-2xl p-6 md:p-8 border border-light-silver dark:border-surface-ash shadow-sm relative">
        <button onClick={() => { setIsAdding(false); setFormData({}); }} className="absolute top-6 right-6 md:top-8 md:right-8 text-text-muted hover:text-text-dark dark:hover:text-text-white transition-colors flex items-center gap-2 text-sm font-bold">
          <ArrowLeft size={16} /> Back to List (Esc)
        </button>
        <h2 className="text-section-heading mb-6 flex items-center gap-2 text-text-dark dark:text-text-white border-b border-light-silver dark:border-surface-ash pb-4">
          <Plus size={20} className="text-primary" /> {formData.id ? "Edit Album" : "Add New Album"}
        </h2>
        <form onSubmit={handleSave} className="space-y-4 max-w-xl mt-4">
          <Input label="Album Name *" value={formData.name || ''} onChange={v => setFormData({...formData, name: v})} placeholder="e.g. Divide" autoFocus />
          <Input label="Release Year" value={formData.year || ''} onChange={v => setFormData({...formData, year: v})} placeholder="2017" />
          <CoverUpload 
            label="Album Cover Photo (Download from link or upload file)" 
            value={formData.cover || ''} 
            onChange={v => setFormData({...formData, cover: v})} 
            placeholder="Paste direct image, Spotify, or web link..."
          />
          <button type="submit" className="mt-4 px-6 py-3 rounded-full bg-primary text-text-white font-bold hover:bg-brand-dark transition-colors shadow-md">
            {formData.id ? "Update Album" : "Save Album"} (Enter)
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-surface-graphite rounded-2xl p-6 md:p-8 border border-light-silver dark:border-surface-ash shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-light-silver dark:border-surface-ash pb-4">
        <h2 className="text-section-heading flex items-center gap-2 text-text-dark dark:text-text-white"><Disc size={20} className="text-primary" /> Manage Albums</h2>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-text-white rounded-lg text-sm font-bold hover:bg-brand-dark transition-colors"><Plus size={16} /> Add a New Album</button>
      </div>

      <Toolbar />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-light-silver dark:border-surface-ash text-label text-text-secondary dark:text-text-muted">
              <th className="py-3 px-4 font-bold">Album Name</th>
              <th className="py-3 px-4 font-bold hidden sm:table-cell">Year</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums.map((album) => (
              <tr 
                key={album.id}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Delete") setItemToDelete(album.id);
                  if (e.key === "F2") handleEdit(album);
                }}
                className="border-b border-light-silver dark:border-surface-ash hover:bg-light-pearl dark:hover:bg-surface-cocoa focus:bg-light-pearl dark:focus:bg-surface-cocoa outline-none transition-colors cursor-pointer group"
                title="Select row and press F2 to Edit, Delete to Remove"
              >
                <td className="py-3 px-4 text-body text-text-dark dark:text-text-white font-bold flex items-center gap-3">
                  <img src={album.cover || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 bg-light-silver rounded object-cover" />
                  {album.name}
                </td>
                <td className="py-3 px-4 text-body text-text-secondary dark:text-text-muted hidden sm:table-cell">{album.year}</td>
                <td className="py-3 px-4 text-right space-x-3">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(album); }} className="text-primary hover:text-brand-dark transition-colors text-sm font-bold">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); setItemToDelete(album.id); }} className="text-status-error hover:text-red-700 transition-colors text-sm font-bold">Delete</button>
                </td>
              </tr>
            ))}
            {albums.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-text-muted">No albums added yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Delete Album"
        message="Are you sure you want to delete this album? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </section>
  );
}

function EntityManager({ title, entityName, icon }: { title: string, entityName: 'singers' | 'lyricists' | 'musicians', icon: React.ReactNode }) {
  const [isAdding, setIsAdding] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [formData, setFormData] = useState<Partial<Entity>>({});

  useEffect(() => { loadEntities(); }, [entityName]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAdding) {
        setIsAdding(false);
        setFormData({});
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isAdding]);

  const loadEntities = async () => setEntities(await db.getAllEntities(entityName));

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.name) {
      useToastStore.getState().addToast("Name is required!", "error");
      return;
    }
    const isUpdating = !!formData.id;
    await db.putEntity(entityName, {
      id: formData.id || Math.random().toString(36).substring(7),
      name: formData.name,
      photoUrl: formData.photoUrl || "",
    });
    setFormData({});
    setIsAdding(false);
    loadEntities();
    useToastStore.getState().addToast(isUpdating ? "Entry updated successfully" : "New entry added successfully", "success");
  };

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if(itemToDelete) {
      await db.deleteEntity(entityName, itemToDelete);
      loadEntities();
      setItemToDelete(null);
      useToastStore.getState().addToast("Entry deleted", "success");
    }
  };

  const handleEdit = (item: Entity) => {
    setFormData(item);
    setIsAdding(true);
  };

  if (isAdding) {
    return (
      <section className="bg-white dark:bg-surface-graphite rounded-2xl p-6 md:p-8 border border-light-silver dark:border-surface-ash shadow-sm relative">
        <button onClick={() => { setIsAdding(false); setFormData({}); }} className="absolute top-6 right-6 md:top-8 md:right-8 text-text-muted hover:text-text-dark dark:hover:text-text-white transition-colors flex items-center gap-2 text-sm font-bold">
          <ArrowLeft size={16} /> Back to List (Esc)
        </button>
        <h2 className="text-section-heading mb-6 flex items-center gap-2 text-text-dark dark:text-text-white border-b border-light-silver dark:border-surface-ash pb-4">
          <Plus size={20} className="text-primary" /> {formData.id ? `Edit ${title.replace('Add ', '')}` : title}
        </h2>
        <form onSubmit={handleSave} className="space-y-4 max-w-xl mt-4">
          <Input label="Name *" value={formData.name || ''} onChange={v => setFormData({...formData, name: v})} placeholder="Name..." autoFocus />
          <CoverUpload 
            label="Photo (Download from link or upload file)" 
            value={formData.photoUrl || ''} 
            onChange={v => setFormData({...formData, photoUrl: v})} 
            placeholder="Paste direct image or profile link..."
          />
          <button type="submit" className="mt-4 px-6 py-3 rounded-full bg-primary text-text-white font-bold hover:bg-brand-dark transition-colors shadow-md">
            {formData.id ? "Update Entry" : "Save Entry"} (Enter)
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-surface-graphite rounded-2xl p-6 md:p-8 border border-light-silver dark:border-surface-ash shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b border-light-silver dark:border-surface-ash pb-4">
        <h2 className="text-section-heading flex items-center gap-2 text-text-dark dark:text-text-white">{icon} Manage {entityName}</h2>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-text-white rounded-lg text-sm font-bold hover:bg-brand-dark transition-colors"><Plus size={16} /> Add New</button>
      </div>

      <Toolbar />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-light-silver dark:border-surface-ash text-label text-text-secondary dark:text-text-muted">
              <th className="py-3 px-4 font-bold">Name</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((item) => (
              <tr 
                key={item.id}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Delete") setItemToDelete(item.id);
                  if (e.key === "F2") handleEdit(item);
                }}
                className="border-b border-light-silver dark:border-surface-ash hover:bg-light-pearl dark:hover:bg-surface-cocoa focus:bg-light-pearl dark:focus:bg-surface-cocoa outline-none transition-colors group cursor-pointer"
                title="Select row and press F2 to Edit, Delete to Remove"
              >
                <td className="py-3 px-4 text-body text-text-dark dark:text-text-white font-bold flex items-center gap-3">
                  <img src={item.photoUrl || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 bg-light-silver rounded-full object-cover" />
                  {item.name}
                </td>
                <td className="py-3 px-4 text-right space-x-3">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="text-primary hover:text-brand-dark transition-colors text-sm font-bold">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); setItemToDelete(item.id); }} className="text-status-error hover:text-red-700 transition-colors text-sm font-bold">Delete</button>
                </td>
              </tr>
            ))}
            {entities.length === 0 && <tr><td colSpan={2} className="py-8 text-center text-text-muted">No {entityName} added yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </section>
  );
}

function LanguageForm() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [search, setSearch] = useState("");
  const [newLang, setNewLang] = useState("");

  useEffect(() => { loadLanguages(); }, []);
  const loadLanguages = async () => {
     // Give DB a tiny bit of time to run the seed script if it was just created
     setTimeout(async () => setLanguages(await db.getAllLanguages()), 100);
  };

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLang) return;
    const langName = newLang.trim();
    if (languages.some(l => l.name.toLowerCase() === langName.toLowerCase())) {
       useToastStore.getState().addToast(`${langName} is already added.`, "info");
       return;
    }
    await db.putLanguage({ id: Math.random().toString(36).substring(7), name: langName });
    loadLanguages();
    setNewLang("");
    useToastStore.getState().addToast(`${langName} added successfully`, "success");
  };

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if(itemToDelete) {
      await db.deleteLanguage(itemToDelete);
      loadLanguages();
      setItemToDelete(null);
      useToastStore.getState().addToast("Language deleted", "success");
    }
  };

  const filtered = languages.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="bg-white dark:bg-surface-graphite rounded-2xl p-6 md:p-8 border border-light-silver dark:border-surface-ash shadow-sm">
      <h2 className="text-section-heading mb-6 flex items-center gap-2 text-text-dark dark:text-text-white border-b border-light-silver dark:border-surface-ash pb-4">
        <Globe size={20} className="text-primary" /> Manage Languages
      </h2>
      
      <div className="space-y-6 max-w-3xl">
        <form onSubmit={handleAddLanguage} className="flex gap-3 items-end">
          <div className="flex-1">
             <Input label="Add Custom Language" value={newLang} onChange={setNewLang} placeholder="e.g. Dothraki..." />
          </div>
          <button type="submit" className="h-[46px] px-6 bg-primary text-text-white font-bold rounded-lg hover:bg-brand-dark transition-colors shadow-sm">
             Add
          </button>
        </form>

        <div>
          <h3 className="text-label text-text-secondary dark:text-text-muted mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
             <span>Database Languages ({languages.length})</span>
             <div className="relative w-full sm:w-48">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
               <input 
                 type="text" 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 placeholder="Filter..." 
                 className="w-full bg-light-pearl dark:bg-surface-cocoa border border-light-silver dark:border-surface-ash rounded-md pl-8 pr-3 py-1.5 text-xs text-text-dark dark:text-text-white focus:outline-none focus:ring-1 focus:ring-primary transition-all font-bold"
               />
             </div>
          </h3>
          <div className="flex flex-wrap gap-2.5 max-h-96 overflow-y-auto custom-scrollbar p-1">
            {filtered.length === 0 && <p className="text-body text-text-muted">No languages match your filter.</p>}
            {filtered.map((lang) => (
               <span 
                  key={lang.id} 
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Delete") setItemToDelete(lang.id); }}
                  onClick={() => setItemToDelete(lang.id)} 
                  className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20 hover:bg-status-error hover:text-text-white hover:border-status-error focus:ring-2 focus:ring-primary outline-none transition-colors cursor-pointer shadow-sm flex items-center gap-1 group"
                  title="Click or press Delete to remove"
                >
                 {lang.name} <span className="opacity-0 group-hover:opacity-100">&times;</span>
               </span>
            ))}
          </div>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Remove Language"
        message="Are you sure you want to remove this language tag? This action cannot be undone."
        confirmText="Remove"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </section>
  );
}

// --- UI Helpers ---

function Toolbar() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full bg-light-pearl dark:bg-surface-cocoa border border-light-silver dark:border-surface-ash rounded-lg pl-10 pr-4 py-2.5 text-body text-text-dark dark:text-text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-light-pearl dark:bg-surface-cocoa border border-light-silver dark:border-surface-ash rounded-lg text-text-dark dark:text-text-white hover:border-primary transition-colors text-sm font-bold">
          <Filter size={16} className="text-text-muted" /> Filter
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-light-pearl dark:bg-surface-cocoa border border-light-silver dark:border-surface-ash rounded-lg text-text-dark dark:text-text-white hover:border-primary transition-colors text-sm font-bold">
          <ArrowUpDown size={16} className="text-text-muted" /> Sort
        </button>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-bold text-body ${active ? 'bg-primary text-text-white' : 'text-text-secondary dark:text-text-muted hover:bg-light-mist dark:hover:bg-bg-charcoal hover:text-text-dark dark:hover:text-text-white'}`}>
      {icon} {label}
    </button>
  );
}

function MobileTab({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors ${active ? 'bg-primary text-text-white' : 'bg-light-ivory dark:bg-surface-graphite text-text-secondary dark:text-text-muted'}`}>
      {label}
    </button>
  );
}

function Input({ label, placeholder, value, onChange, autoFocus }: { label: string, placeholder?: string, value: string, onChange: (val: string) => void, autoFocus?: boolean }) {
  return (
    <div>
      <label className="block text-body text-text-dark dark:text-text-soft-white mb-1">{label}</label>
      <input type="text" autoFocus={autoFocus} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-light-pearl dark:bg-surface-cocoa border border-light-silver dark:border-surface-ash rounded-lg px-4 py-2.5 text-body text-text-dark dark:text-text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
    </div>
  );
}

function ConfirmModal({ isOpen, title, message, confirmText, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string, confirmText: string, onConfirm: () => void, onCancel: () => void }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-surface-graphite rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-status-error/10 text-status-error rounded-full flex items-center justify-center mb-6">
          <LogOut size={32} />
        </div>
        <h3 className="text-2xl font-black text-text-dark dark:text-text-white mb-2">{title}</h3>
        <p className="text-body text-text-secondary dark:text-text-muted mb-8">
          {message}
        </p>
        <div className="flex w-full gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 bg-light-silver dark:bg-surface-ash text-text-dark dark:text-text-white font-bold rounded-xl hover:bg-light-mist transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 bg-status-error text-text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
