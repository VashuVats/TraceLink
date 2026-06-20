/** @type {import('next').NextConfig} */
const nextConfig = {
  // Leaflet + react-leaflet double-mount under Strict Mode causes
  // "Map container is already initialized" in dev.
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
