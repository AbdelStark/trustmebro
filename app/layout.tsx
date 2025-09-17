import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import ProvenHeightBadge from "@/components/ProvenHeightBadge";
import { getSiteUrl } from "@/lib/site";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const site = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "TrustMeBro — ZK ready Bitcoin Explorer",
    template: "%s — TrustMeBro",
  },
  description: "ZK ready Bitcoin Explorer. Elegant, fast, and Esplora-compatible with local verification hooks.",
  keywords: ["Bitcoin", "Explorer", "Blocks", "Transactions", "SPV", "ZK", "Raito"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site,
    title: "TrustMeBro — ZK ready Bitcoin Explorer",
    description: "Elegant, fast Bitcoin explorer with ZK-ready verification.",
    siteName: "TrustMeBro",
    images: [
      { url: "/og", width: 1200, height: 630, alt: "TrustMeBro" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustMeBro — ZK ready Bitcoin Explorer",
    description: "Elegant, fast Bitcoin explorer with ZK-ready verification.",
    images: ["/og"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--bg)] text-[var(--text)]`}>
        <Providers>
          <header className="sticky top-0 z-10 border-b border-white/10 bg-[var(--panel)]/80 backdrop-blur-md">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
              <Link href="/" className="font-bold tracking-tight text-[var(--accent-600)]">
                ₿ TrustMeBro
              </Link>
              <span className="label hidden sm:inline">ZK ready Bitcoin Explorer</span>
              <div className="flex-1" />
              <ProvenHeightBadge />
              <SearchBar />
            </div>
            <div className="divider" />
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6">
            {children}
          </main>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
