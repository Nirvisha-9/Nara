import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter, Playfair_Display, Nunito } from "next/font/google";
import { EazoProvider } from "@eazo/sdk/react";
import { cn } from "@/utils/utils";
import { Toaster } from "@/components/ui/sonner";
import { UserSyncEffect } from "@/components/user-profile/user-sync-effect";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

const publicOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(publicOrigin),
  title: "Nara — Every child is different. Now there's a guide for yours.",
  description: "A warm, emotionally intelligent parenting companion that learns your child and provides real-time guidance for autism, ADHD, anxiety, sensory processing, and more.",
  openGraph: {
    title: "Nara",
    description: "Nara is a warm, emotionally intelligent parenting companion for parents and caregivers of children facing any challenge — autism, ADHD, anxiety, sens...",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nara",
    description: "Nara is a warm, emotionally intelligent parenting companion for parents and caregivers of children facing any challenge — autism, ADHD, anxiety, sens...",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", inter.variable, playfair.variable, nunito.variable)}>
      <body className="min-h-svh flex flex-col bg-[#FAF7F2]">
        <EazoProvider>
          <UserSyncEffect />
          {children}
          <Toaster />
        </EazoProvider>
      </body>
    </html>
  );
}
