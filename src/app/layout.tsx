import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoadingBar from "@/components/layout/LoadingBar";
import { Suspense } from "react";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Disada - Diskusi Bareng IKADA",
  description: "Platform resmi Disada (Diskusi Bareng IKADA) Jabodetabek-Banten. Wadah kolaborasi, inovasi, dan silaturahmi alumni Pondok Pesantren Darussalam.",
  keywords: "opini, disada, ikada, artikel, diskusi, komunitas",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Disada",
  },
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <Suspense fallback={null}>
          <LoadingBar />
        </Suspense>
        <Navbar />
        <main className="main-content animate-fade-in">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
