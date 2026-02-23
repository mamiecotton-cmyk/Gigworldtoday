import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "GigWorldToday – Gig Economy Intelligence",
  description:
    "News, platform comparisons, tutorials, and ratings for modern gig workers.",
  metadataBase: new URL("https://gigworldtoday.com"),
  openGraph: {
    title: "GigWorldToday",
    description:
      "The intelligence hub for gig workers.",
    url: "https://gigworldtoday.com",
    siteName: "GigWorldToday",
    type: "website",
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
      <body>
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
