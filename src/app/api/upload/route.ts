import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const requestedFolder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const isImage = file.type.startsWith('image/');
    const folder = requestedFolder || (isImage ? 'ttune_covers' : 'ttune_audio');
    const resourceType = isImage ? 'image' : 'video'; // Cloudinary treats audio as 'video'

    // Attempt upload to Cloudinary via stream
    try {
      const cloudinary = getCloudinary();
      if (process.env.CLOUDINARY_URL) {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { 
              resource_type: resourceType, 
              folder 
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        if (uploadResult && uploadResult.secure_url) {
          return NextResponse.json({
            ...uploadResult,
            url: uploadResult.secure_url,
            secure_url: uploadResult.secure_url
          });
        }
      }
    } catch (cloudErr) {
      console.warn("Cloudinary upload failed, falling back to data URL:", cloudErr);
    }

    // Fallback to data URL only if Cloudinary is unavailable
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type || (isImage ? 'image/jpeg' : 'audio/mpeg')};base64,${base64}`;

    return NextResponse.json({
      secure_url: dataUrl,
      url: dataUrl,
      format: file.name.split('.').pop() || '',
      bytes: file.size
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
