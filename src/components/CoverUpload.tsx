"use client";

import { useState } from "react";
import { Download, Upload, Image as ImageIcon, X, Loader2, CheckCircle2 } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

interface CoverUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export function CoverUpload({ 
  value, 
  onChange, 
  label = "Cover Photo", 
  placeholder = "Paste direct image, Spotify, or web link..." 
}: CoverUploadProps) {
  const [inputUrl, setInputUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Download cover from link via backend API
  const handleDownloadFromLink = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const urlToFetch = (inputUrl || value || "").trim();
    if (!urlToFetch) {
      useToastStore.getState().addToast("Please paste an image or web link first.", "info");
      return;
    }

    try {
      setIsDownloading(true);
      useToastStore.getState().addToast("Downloading cover photo from link...", "info");

      const res = await fetch("/api/download-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToFetch }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to download cover photo from this link.");
      }

      setPreviewError(false);
      onChange(data.url);
      setInputUrl("");
      useToastStore.getState().addToast("Cover photo downloaded and saved successfully!", "success");
    } catch (err: any) {
      console.error("Cover download error:", err);
      useToastStore.getState().addToast(err.message || "Failed to download cover photo.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  // Upload local image file (PNG, JPG, WEBP, etc.)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      useToastStore.getState().addToast("Please choose an image file (PNG, JPG, WEBP).", "error");
      return;
    }

    try {
      setIsUploading(true);
      useToastStore.getState().addToast("Uploading cover photo...", "info");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "ttune_covers");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.secure_url) {
        throw new Error(data.error || "Failed to upload image file.");
      }

      setPreviewError(false);
      onChange(data.secure_url);
      useToastStore.getState().addToast("Cover photo uploaded successfully!", "success");
    } catch (err: any) {
      console.error("File upload error:", err);
      useToastStore.getState().addToast(err.message || "Failed to upload image.", "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleClear = () => {
    onChange("");
    setInputUrl("");
    setPreviewError(false);
  };

  return (
    <div className="space-y-2">
      <label className="block text-body text-text-dark dark:text-text-soft-white font-medium">
        {label}
      </label>

      <div className="bg-light-pearl dark:bg-surface-cocoa border border-light-silver dark:border-surface-ash rounded-xl p-4 transition-all">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          
          {/* Live Preview Thumbnail */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-light-silver dark:bg-surface-ash overflow-hidden flex-shrink-0 relative border border-light-silver/50 dark:border-white/10 shadow-sm flex items-center justify-center group">
            {value && !previewError ? (
              <>
                <img 
                  src={value} 
                  alt="Cover Preview" 
                  onError={() => setPreviewError(true)}
                  className="w-full h-full object-cover" 
                />
                <button
                  type="button"
                  onClick={handleClear}
                  title="Remove Cover"
                  className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-text-muted text-center p-2">
                <ImageIcon size={28} className="mb-1 opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-wider">No Cover</span>
              </div>
            )}

            {(isDownloading || isUploading) && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                <Loader2 size={24} className="animate-spin text-primary mb-1" />
                <span className="text-[10px] font-bold">Saving...</span>
              </div>
            )}
          </div>

          {/* Action Inputs: Link Download & File Upload */}
          <div className="flex-1 w-full space-y-2">
            
            {/* 1. Download from Link */}
            <form onSubmit={handleDownloadFromLink} className="flex gap-2">
              <input
                type="text"
                placeholder={placeholder}
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                disabled={isDownloading || isUploading}
                className="flex-1 bg-white dark:bg-surface-graphite border border-light-silver dark:border-surface-ash rounded-lg px-3 py-2 text-sm text-text-dark dark:text-text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputUrl || isDownloading || isUploading}
                className="px-3.5 py-2 bg-primary text-text-white rounded-lg text-xs font-bold hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0 shadow-sm"
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Fetching...
                  </>
                ) : (
                  <>
                    <Download size={14} /> Download
                  </>
                )}
              </button>
            </form>

            {/* 2. File Upload & Status info */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-light-silver/50 dark:border-surface-ash/50 text-xs text-text-secondary dark:text-text-muted">
              <div>
                <input
                  type="file"
                  id={`cover-file-input-${label.replace(/\s+/g, '-')}`}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor={`cover-file-input-${label.replace(/\s+/g, '-')}`}
                  className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-primary hover:underline"
                >
                  <Upload size={14} /> Upload image file from device
                </label>
              </div>

              {value && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-status-success">
                  <CheckCircle2 size={12} /> Active Cover Linked
                </span>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
