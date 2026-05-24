/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  async headers() {
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "form-action 'self'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' https://fonts.gstatic.com https://vercel.live https://assets.vercel.com data:",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
          "script-src 'self' 'unsafe-inline' https://vercel.live",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://wa.me https://vercel.live wss://ws-us3.pusher.com",
          "frame-src https://vercel.live",
          "upgrade-insecure-requests",
        ].join('; '),
      },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
