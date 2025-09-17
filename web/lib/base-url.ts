import { headers } from "next/headers";

// Build an absolute base URL for server-side fetches (Next.js 15: headers() can be async)
export async function getBaseUrl() {
  // Prefer forwarded headers when behind a proxy
  const h = await (headers() as any);
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("x-forwarded-host") || h.get("host");
  if (host) return `${proto}://${host}`;

  // Fallbacks for local/dev environments
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  return "http://localhost:3000";
}
