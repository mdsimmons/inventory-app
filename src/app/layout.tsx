import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { initSchema } from "@/lib/db";
import { seed } from "@/lib/seed";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stockroom Inventory",
  description: "Inventory management for your stockroom",
};

export const viewport = "width=device-width, initial-scale=1, viewport-fit=cover";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await initSchema();
  await seed();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <Link href="/" className="text-lg font-bold text-gray-900 shrink-0">Stockroom</Link>
            <nav className="flex gap-1">
              <Link href="/" className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200">
                Inventory
              </Link>
              <Link href="/orders" className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200">
                Orders
              </Link>
              <Link href="/manage" className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200">
                Manage
              </Link>
              <Link href="/settings" className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200">
                Settings
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-3 md:px-4 py-4 md:py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
