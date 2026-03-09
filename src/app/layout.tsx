import type { Metadata } from 'next';
import './globals.css';
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
    description:
      "The intelligence hub for gig workers.",
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
        <meta name="fo-verify" content="1b6c9375-9cc9-4b2d-90a2-f950d0538677" />
        <meta name="impact-site-verification" content="f2ede82b-bf8f-44d5-8217-48b16968b04c" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-1DMN4WWE51" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);} 
              gtag('js', new Date());
              gtag('config', 'G-1DMN4WWE51');
            `,
          }}
        />
      </head>
      <body>
        <div className="fixed inset-0 -z-10">
          <img
            src="/city-bg.png"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/30"></div>
        </div>
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
        <ExitSurvey />
      </body>
    </html>
  );
}
