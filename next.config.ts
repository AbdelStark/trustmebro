import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
];

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
    ];
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, layers: true, topLevelAwait: true } as any;
    return config;
  },
};

export default nextConfig;
