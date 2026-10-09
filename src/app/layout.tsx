import type { Metadata } from "next";
import { PT_Sans_Narrow } from "next/font/google";
import { GlobalPlayer } from "@/components/GlobalPlayer";
import "./globals.css";

const ptSansNarrow = PT_Sans_Narrow({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-pt-sans-narrow",
});

export const metadata: Metadata = {
  title: "T-Tune",
  description: "A beautiful offline music player",
  manifest: "/manifest.json",
  themeColor: "#171416",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "T-Tune",
  },
};

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PlayerSpacer } from "@/components/PlayerSpacer";
import { ToastProvider } from "@/components/ToastProvider";
import { SyncProvider } from "@/components/SyncProvider";
import { ContextMenuBlocker } from "@/components/ContextMenuBlocker";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${ptSansNarrow.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col font-sans overflow-hidden bg-light-ivory dark:bg-bg-midnight select-none">
        <div className="flex flex-1 overflow-hidden">
          <Navigation />
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
            <PlayerSpacer />
          </div>
        </div>
        <GlobalPlayer />
        <ToastProvider />
        <SyncProvider />
        <ContextMenuBlocker />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
