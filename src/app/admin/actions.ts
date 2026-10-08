"use server";

import { revalidatePath } from "next/cache";

/**
 * Server Actions for Admin Page
 */

export async function downloadExternalUrlToMemory(url: string) {
  // Mock action to download external URLs (e.g. YouTube/Soundcloud extraction) 
  // into memory before compressing and sending to Cloudinary
  console.log(`Downloading ${url}...`);
  return { success: true, message: "Downloaded securely." };
}

export async function revalidateLibrary() {
  // Tells Next.js to revalidate the main page after new songs are uploaded
  revalidatePath("/");
}
