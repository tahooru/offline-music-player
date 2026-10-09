import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Please provide a valid http or https URL.' }, { status: 400 });
    }

    let targetImageUrl = url.trim();

    // 1. Special check for YouTube URLs
    const ytMatch = targetImageUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      targetImageUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }

    // 2. Fetch the target URL to inspect Content-Type
    const headOrGetRes = await fetch(targetImageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*, text/html, */*'
      }
    });

    if (!headOrGetRes.ok) {
      throw new Error(`Failed to fetch link (HTTP ${headOrGetRes.status})`);
    }

    const contentType = headOrGetRes.headers.get('content-type') || '';

    // 3. If the link points to an HTML web page (e.g. Spotify, Gaana, SoundCloud, web page), extract og:image
    if (contentType.includes('text/html')) {
      const html = await headOrGetRes.text();
      
      // Look for og:image or twitter:image
      const ogMatch = html.match(/<meta\s+[^>]*property=["'](?:og:image|og:image:url)["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["'](?:og:image|og:image:url)["']/i) ||
                      html.match(/<meta\s+[^>]*name=["'](?:twitter:image|twitter:image:src)["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["'](?:twitter:image|twitter:image:src)["']/i);

      if (ogMatch && ogMatch[1]) {
        targetImageUrl = ogMatch[1];
        // Clean up entity encoding
        targetImageUrl = targetImageUrl.replace(/&amp;/g, '&');
      } else {
        throw new Error("Could not find a cover image on this web page. Please provide a direct image link.");
      }
    }

    // 4. Download the actual image bytes to bypass any referrer / hotlink protection
    const imageRes = await fetch(targetImageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*'
      }
    });

    if (!imageRes.ok) {
      throw new Error(`Failed to download image from ${targetImageUrl} (HTTP ${imageRes.status})`);
    }

    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const rawContentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const finalContentType = rawContentType.split(';')[0].trim();

    // 5. Attempt Cloudinary upload
    try {
      if (process.env.CLOUDINARY_URL) {
        const cloudinary = getCloudinary();
        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'ttune_covers' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(imageBuffer);
        });

        if (uploadResult && uploadResult.secure_url) {
          return NextResponse.json({ 
            success: true, 
            url: uploadResult.secure_url,
            source: 'cloudinary' 
          });
        }
      }
    } catch (cloudErr) {
      console.warn("Cloudinary upload failed, falling back to data URL:", cloudErr);
    }

    // 6. Fallback: return base64 Data URL so it works offline and directly in IndexedDB
    const base64 = imageBuffer.toString('base64');
    const dataUrl = `data:${finalContentType};base64,${base64}`;

    return NextResponse.json({ 
      success: true, 
      url: dataUrl,
      source: 'data-url' 
    });

  } catch (error: any) {
    console.error("Download Cover Error:", error);
    return NextResponse.json({ 
      error: error.message || 'Failed to download cover photo from the provided link.' 
    }, { status: 500 });
  }
}
