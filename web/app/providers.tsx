"use client";

/**
 * What this file does
 * Wraps the app with client-side providers (React Query, etc.).
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const client = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

