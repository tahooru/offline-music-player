import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

export function getCloudinary() {
  if (!isConfigured) {
    const cUrl = process.env.CLOUDINARY_URL || '';
    const match = cUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.*)/);
    if (match) {
      cloudinary.config({
        cloud_name: match[3],
        api_key: match[1],
        api_secret: match[2],
        secure: true
      });
      isConfigured = true;
    } else {
      console.warn("Cloudinary URL not found or invalid format in CLOUDINARY_URL");
    }
  }
  return cloudinary;
}
