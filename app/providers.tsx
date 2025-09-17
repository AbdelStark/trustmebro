"use client";

/**
 * What this file does
 * Wraps the app with client-side providers (React Query, etc.).
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const client = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Helpful build stamp to correlate what is deployed
    const sha = process.env.NEXT_PUBLIC_COMMIT_SHA || "dev";
    // eslint-disable-next-line no-console
    console.log(`[Build] commit=${sha}`);
  }, []);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
