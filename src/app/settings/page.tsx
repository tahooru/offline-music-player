"use client";

import { useEffect, useState } from "react";
import { Download, HelpCircle, CheckCircle } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

export default function SettingsPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      addToast("App installed successfully!", "success");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [addToast]);

  const handleInstallClick = async () => {
    if (isInstalled) {
      addToast("App is already installed natively.", "info");
      return;
    }
    
    if (!deferredPrompt) {
      addToast("Install prompt is not available right now. Your browser may not support it or you've already installed it.", "info");
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto flex-1 flex flex-col gap-12 pb-24">
      <header>
        <h1 className="text-hero-heading text-brand-dark dark:text-brand-light">Settings</h1>
      </header>

      <section id="install" className="scroll-mt-6 bg-white dark:bg-surface-graphite rounded-xl p-6 border border-light-silver dark:border-surface-ash shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-light-mist dark:bg-surface-cocoa rounded-full text-primary flex-shrink-0">
            {isInstalled ? <CheckCircle size={24} /> : <Download size={24} />}
          </div>
          <div>
            <h2 className="text-section-heading text-text-dark dark:text-text-white">
              {isInstalled ? "App Installed" : "Install App"}
            </h2>
            <p className="text-metadata text-text-secondary dark:text-text-muted mt-1">
              {isInstalled ? "T-Tune is running as a native application on your device." : "Add T-Tune to your homescreen for native access."}
            </p>
          </div>
        </div>
        {!isInstalled && (
          <button 
            onClick={handleInstallClick}
            disabled={!deferredPrompt}
            className="mt-2 w-full md:w-auto px-6 py-3 rounded-full bg-primary text-text-white text-btn hover:bg-brand-dark transition-colors shadow-md disabled:opacity-50"
          >
            Install PWA
          </button>
        )}
      </section>

      <section id="how-it-works" className="scroll-mt-6">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="text-brand-light" />
          <h2 className="text-section-heading text-text-dark dark:text-text-white">How it Works?</h2>
        </div>
        <div className="bg-light-pearl dark:bg-surface-cocoa rounded-xl p-6 text-body text-text-dark dark:text-text-white space-y-4">
          <p>
            <strong>1. Browse & Discover:</strong> Find your favorite songs, artists, and playlists from our extensive library.
          </p>
          <p>
            <strong>2. Seamless Syncing:</strong> As you listen, your music is instantly saved to your device for smooth, uninterrupted playback.
          </p>
          <p>
            <strong>3. True Offline Mode:</strong> Jump on a plane or go off the grid. All your synced songs will play flawlessly without an internet connection.
          </p>
          <p>
            <strong>4. Custom Playlists:</strong> Build your perfect collections and organize your music exactly the way you want it.
          </p>
        </div>
      </section>
    </div>
  );
}
