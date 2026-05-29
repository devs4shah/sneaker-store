import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

let apiHostname = "localhost";
let apiPort: string | undefined = "8080";
let apiProtocol: "http" | "https" = "http";

try {
  const parsed = new URL(apiUrl);
  apiHostname = parsed.hostname;
  apiPort = parsed.port || undefined;
  apiProtocol = parsed.protocol === "https:" ? "https" : "http";
} catch {
  // use defaults above
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: apiProtocol,
        hostname: apiHostname,
        port: apiPort,
        pathname: "/**",
      },
      // Seed / demo external image hosts
      {
        protocol: "https",
        hostname: "images.example.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
