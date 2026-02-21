import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Link from "next/link";

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
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-2xl font-bold mb-4">Gig World Today</h3>
                <p className="text-gray-400 mb-4">
                  Your comprehensive directory for finding gig economy platforms. 
                  Compare opportunities, requirements, and find the perfect gig work for you.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/platforms" className="hover:text-white">Browse Platforms</a></li>
                  <li><a href="/platforms" className="hover:text-white">Categories</a></li>
                  <li>
                    <Link href="/blog" className="hover:text-white">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Gig World Today. All rights reserved.</p><p className="mt-2 text-xs text-gray-500">ZIP code data by <a href="https://simplemaps.com/data/us-zips" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">simplemaps.com</a></p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
