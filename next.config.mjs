import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  pwaExcludes: [
    /.*firebase.*$/,
  ],
});

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
