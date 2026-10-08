/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // This is crucial: Cache the Cloudinary domain for offline playback
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 Days
      },
    },
  ],
});

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);