/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@firebase/app-check');
    }
    return config;
  },
};

export default nextConfig;
