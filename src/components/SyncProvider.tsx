"use client";

import { useEffect } from "react";
import { db } from "@/lib/db";

export function SyncProvider() {
  useEffect(() => {
    // Attempt to sync from Supabase silently in the background
    db.syncFromCloud().catch(console.error);
  }, []);

  return null;
}
