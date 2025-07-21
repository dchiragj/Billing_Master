/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    appDir: true, // Enables App Router
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure @react-pdf/renderer is only bundled for the client
      config.resolve.alias['@react-pdf/renderer'] = '@react-pdf/renderer/lib/react-pdf.browser.js';
    }
    return config;
  },
};

export default nextConfig;