import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from 'next/dynamic';
import "./globals.css";

// Dynamically import performance monitor to avoid affecting initial bundle
const PerformanceMonitor = dynamic(
  () => import('../components/optimized/PerformanceMonitor'),
  { ssr: false }
);

// Optimized font loading with display swap and preload
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

export const metadata: Metadata = {
  title: "Begin Learning Profile - Discover Your Child's Learning Superpowers",
  description: "Help your child's teacher understand their unique learning style from Day 1. Free 5-minute assessment with personalized results and teacher-approved insights.",
  keywords: ["learning profile", "education", "child development", "teacher resources", "personalized learning"],
  authors: [{ name: "Begin Learning" }],
  openGraph: {
    title: "Begin Learning Profile - Discover Your Child's Learning Superpowers",
    description: "Help your child's teacher understand their unique learning style from Day 1. Free 5-minute assessment with personalized results.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Begin Learning Profile",
    description: "Discover your child's learning superpowers in just 5 minutes.",
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
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Viewport meta tag for proper mobile rendering */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#007A72" />
        
        {/* Apple touch icon and favicon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* PWA meta tags */}
        <meta name="application-name" content="Begin Learning Profile" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Begin Learning" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#007A72" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${inter.variable} antialiased font-sans`}
        suppressHydrationWarning={true}
      >
        {children}
        {/* Performance monitoring in development */}
        {process.env.NODE_ENV === 'development' && (
          <PerformanceMonitor enabled={true} showDebugInfo={true} />
        )}
        {/* Performance monitoring in production (analytics only) */}
        {process.env.NODE_ENV === 'production' && (
          <PerformanceMonitor enabled={true} showDebugInfo={false} />
        )}
      </body>
    </html>
  );
}
