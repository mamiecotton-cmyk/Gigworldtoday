import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://gigworldtoday.com'),
  title: {
    default: 'Gig World Today - Find Gig Apps Hiring Near You',
    template: '%s | Gig World Today'
  },
  description: 'Discover 30+ gig economy platforms. Compare requirements, pay, and availability for food delivery, catering, rideshare, and more. Find gig work in your area.',
  keywords: ['gig economy', 'food delivery', 'rideshare', 'doordash', 'uber eats', 'instacart', 'gig work', 'side hustle', 'delivery driver'],
  authors: [{ name: 'Gig World Today' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gigworldtoday.com',
    siteName: 'Gig World Today',
    title: 'Gig World Today - Find Gig Apps Hiring Near You',
    description: 'Discover 30+ gig economy platforms. Compare requirements, pay, and availability for food delivery, catering, rideshare, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gig World Today',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gig World Today - Find Gig Apps Hiring Near You',
    description: 'Discover 30+ gig economy platforms. Compare requirements, pay, and availability.',
    images: ['/og-image.png'],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
