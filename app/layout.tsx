import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrustMeBro Explorer",
  description: "A ZK-enabled Bitcoin explorer (mocked ZK)",
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
              <SearchBar />
            </div>
            <div className="divider" />
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
