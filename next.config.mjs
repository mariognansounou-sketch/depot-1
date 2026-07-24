import { PHASE_PRODUCTION_BUILD } from "next/constants.js";

/**
 * Fails fast with a clear, actionable message when a required env var is
 * missing or malformed, instead of letting the app boot and crash
 * confusingly on the first request that touches Prisma/Auth/encryption.
 * Skipped during `next build` (PHASE_PRODUCTION_BUILD): some CI/Docker
 * pipelines build the image without runtime secrets and inject them only
 * at `next start` — this only needs to hold at actual runtime.
 */
function validateEnv() {
  const missing = [];
  const invalid = [];

  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.AUTH_SECRET) missing.push("AUTH_SECRET");

  if (!process.env.ENCRYPTION_KEY) {
    missing.push("ENCRYPTION_KEY");
  } else if (!/^[0-9a-f]{64}$/i.test(process.env.ENCRYPTION_KEY)) {
    invalid.push("ENCRYPTION_KEY (must be a 32-byte hex string — 64 characters — generate with: openssl rand -hex 32)");
  }

  if (missing.length === 0 && invalid.length === 0) return;

  const lines = [
    "\n✖ AdWinner OS cannot start: invalid environment configuration.",
    ...missing.map((name) => `  - ${name} is not set.`),
    ...invalid.map((detail) => `  - ${detail}`),
    "  See .env.example for the full list of variables and how to generate secrets.\n",
  ];
  throw new Error(lines.join("\n"));
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.facebook.com" },
      { protocol: "https", hostname: "scontent.**" },
    ],
  },
};

export default (phase) => {
  if (phase !== PHASE_PRODUCTION_BUILD) {
    validateEnv();
  }
  return nextConfig;
};
