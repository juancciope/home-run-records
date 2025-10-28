import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'viberate-upload.ams3.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Spotify subdomain - rewrite to /spotify path (excluding static assets and auth)
        {
          source: '/:path((?!_next|api|auth|favicon.ico).*)*',
          has: [
            {
              type: 'host',
              value: 'spotify.homeformusic.app',
            },
          ],
          destination: '/spotify/:path*',
        },
        // Social subdomain - rewrite to /social path (excluding static assets and auth)
        {
          source: '/:path((?!_next|api|auth|favicon.ico).*)*',
          has: [
            {
              type: 'host',
              value: 'social.homeformusic.app',
            },
          ],
          destination: '/social/:path*',
        },
        // Audience subdomain - rewrite to /audience path (excluding static assets and auth)
        {
          source: '/:path((?!_next|api|auth|favicon.ico).*)*',
          has: [
            {
              type: 'host',
              value: 'audience.homeformusic.app',
            },
          ],
          destination: '/audience/:path*',
        },
      ],
    }
  },
};

export default nextConfig;
