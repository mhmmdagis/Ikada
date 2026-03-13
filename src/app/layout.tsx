import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Disada - Diskusi Bareng Ikada",
  description: "Platform diskusi modern, ruang tulisan dan forum edukatif untuk remaja dan profesional.",
  keywords: "diskusi, disada, ikada, artikel, opini, komunitas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
