import type { NextConfig } from "next";

const ENV =process.env.NODE_ENV

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  rewrites: async () => {
    if (ENV !== 'development') {
      return []
    }
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5555/:path*',
      },
    ];
  },
};

export default nextConfig;
