import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { Suspense } from 'react';
import GlobalLoading from './loading';
import ReportIssue from '@/components/ReportIssue';
import AuthWrapper from './dashboard/authwrapper';
import GoogleAnalytics from './GoogleAnalytics';

const dmSans = DM_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Heizen | Ship MVPs faster than ever',
  description: 'AI + Humans building MVPs in 1 week.',
  keywords: 'Heizen, startup, mvp, AI, humans, LLM, Product hunt',
  appleWebApp: {
    title: 'Heizen',
  },
  openGraph: {
    title: 'Heizen | Ship MVPs faster than ever',
    description: 'AI + Humans building MVPs in 1 week.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    images: [
      {
        url: '/cover.png',
        width: 1200,
        height: 630,
        alt: 'Heizen',
      },
    ],
    siteName: 'Heizen',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heizen | Ship MVPs faster than ever',
    description: 'AI + Humans building MVPs in 1 week.',
    images: ['/cover.png'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.className} `}>
        <Suspense fallback={<GlobalLoading />}>
          <Providers>
            <GoogleAnalytics />
            <AuthWrapper>{children}</AuthWrapper>
          </Providers>
          <ReportIssue />
        </Suspense>
      </body>
    </html>
  );
}
