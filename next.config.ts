import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The ingest API handles user-supplied archives. Keep its runtime on Node.js.
  serverExternalPackages: ['fflate'],
};

export default nextConfig;
