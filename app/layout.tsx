import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kin — AI Website Change Monitor',
  description: 'Add a URL. Kin tells you when it matters. AI-powered website monitoring with plain-English alerts.',
  keywords: ['website monitoring', 'change detection', 'AI', 'scraping', 'Kin', 'SaaS'],
  openGraph: {
    title: 'Kin — AI Website Change Monitor',
    description: 'Add a URL. Kin tells you when it matters.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
