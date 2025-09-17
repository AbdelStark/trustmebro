/**
 * What this file does
 * Computes the absolute site URL for canonical links, OG, robots and sitemap.
 */
export function getSiteUrl() {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

