/**
 * Autor: Brandon Medina
 * Fecha: 11/05/2026
 * DescripciÃ³n: Layout raÃ­z de Next.js para NENEZ.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono, Comfortaa, Quicksand } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "4GO",
  description:
    "Descubre los mejores eventos, conciertos y experiencias en Ecuador con 4GO.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/alien_green_hands_white.jpg?v=3", type: "image/jpeg" },
    ],
    shortcut: "/images/alien_green_hands_white.jpg?v=3",
    apple: "/images/alien_green_hands_white.jpg?v=3",
  },
  appleWebApp: { capable: true, title: "4GO", statusBarStyle: "black-translucent" },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${comfortaa.variable} ${quicksand.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/images/alien_green_hands_white.jpg?v=3" type="image/jpeg" />
        <link rel="shortcut icon" href="/images/alien_green_hands_white.jpg?v=3" type="image/jpeg" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/images/alien_green_hands_white.jpg?v=3" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
