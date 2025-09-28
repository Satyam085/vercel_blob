import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vercel Blob Manager",
  description:
    "Manage your Vercel Blob Storage with ease — upload, preview, download, delete, and export file URLs in a modern Next.js app.",
  keywords: [
    "Next.js",
    "Vercel Blob",
    "Blob Storage",
    "File Manager",
    "Upload",
    "Download",
    "Cloud Storage",
  ],
  authors: [{ name: "Your Name", url: "https://github.com/satyam085" }],
  openGraph: {
    title: "Vercel Blob Manager",
    description:
      "A modern Next.js app to manage Vercel Blob Storage: upload, preview, delete, and export file URLs.",
    url: "https://your-deployment-url.vercel.app",
    siteName: "Vercel Blob Manager",
    images: [
      {
        url: "https://your-deployment-url.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vercel Blob Manager",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vercel Blob Manager",
    description:
      "Manage your Vercel Blob Storage with ease using this Next.js app.",
    images: ["https://your-deployment-url.vercel.app/og-image.png"],
    creator: "@satyam085",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
