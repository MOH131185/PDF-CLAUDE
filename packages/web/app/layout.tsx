import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF Tools - Free Online PDF Merger, Splitter & Compressor",
  description: "Professional PDF tools for merging, splitting, and compressing PDF files online. Free, secure, and fast. No registration required.",
  keywords: "PDF tools, merge PDF, split PDF, compress PDF, PDF merger, PDF splitter, PDF compressor, online PDF tools",
  authors: [{ name: "PDF Tools Team" }],
  creator: "PDF Tools",
  publisher: "PDF Tools",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pdftools.com'),
  openGraph: {
    title: "PDF Tools - Free Online PDF Merger, Splitter & Compressor",
    description: "Professional PDF tools for merging, splitting, and compressing PDF files online. Free, secure, and fast.",
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "PDF Tools",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PDF Tools - Online PDF Processing"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Tools - Free Online PDF Processing",
    description: "Professional PDF tools for merging, splitting, and compressing PDF files online.",
    creator: "@pdftools",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
