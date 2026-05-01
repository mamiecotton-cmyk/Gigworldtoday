import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ExitSurvey from '@/components/ExitSurvey';

export const metadata: Metadata = {
  title: "GigWorldToday – Gig Economy Intelligence",
  description:
    "News, platform comparisons, tutorials, and ratings for modern gig workers.",
  metadataBase: new URL("https://www.gigworldtoday.com"),
  openGraph: {
    title: "GigWorldToday",
    description: "The intelligence hub for gig workers.",
    url: "https://www.gigworldtoday.com",
    siteName: "GigWorldToday",
    type: "website",
    images: [
      {
        url: "https://www.gigworldtoday.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Verification tags */}
        <meta name="fo-verify" content="1b6c9375-9cc9-4b2d-90a2-f950d0538677" />
        <meta name="impact-site-verification" content="f2ede82b-bf8f-44d5-8217-48b16968b04c" />

        {/* Preload the LCP background image so the browser fetches it ASAP */}
        <link
          rel="preload"
          as="image"
          href="/city-bg.webp"
          fetchPriority="high"
        />

        {/* Preconnect to third-party origins */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://emrldtp.com" />
      </head>
      <body>
        {/* Background — Next.js Image for automatic WebP + CDN optimization */}
        <div className="fixed inset-0 -z-10" aria-hidden="true">
          <Image
            src="/city-bg.webp"
            alt=""
            fill
            priority
            quality={75}
            sizes="100vw"
            className="object-cover"
            // @ts-ignore — forces fetchpriority on the underlying <img>
            fetchpriority="high"
            decoding="sync"
          />
          <div className="absolute inset-0 bg-white/30" />
        </div>

        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
        <ExitSurvey />

        {/* Google Tag Manager — afterInteractive keeps it off the critical path */}
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1DMN4WWE51');
            `,
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1DMN4WWE51"
          strategy="afterInteractive"
        />

        {/* AdSense — lazyOnload so it never blocks render */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2135265147864365"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />

        {/* emrldtp — lazyOnload, zero render impact */}
        <Script
          src="https://emrldtp.com/NTA3Mjg5.js?t=507289"
          strategy="lazyOnload"
          data-noptimize="1"
          data-cfasync="false"
          data-wpfc-render="false"
        />
      </body>
    </html>
  );
}