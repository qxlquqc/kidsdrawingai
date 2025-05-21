import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientCursorEffect from "@/components/client-cursor-effect";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KidsDrawingAi - Transform Children's Drawings with AI Magic",
  description: "Turn your child's simple drawings into beautiful artwork with our powerful AI technology. Upload, enhance, and share in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} site-background`}>
        <ClientCursorEffect />
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
