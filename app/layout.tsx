// file: app/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import Providers from './providers';
import '@/app/globals.css';
import LogRocketInit from '@/components/Logrocket/Logrocket';

export const metadata: Metadata = {
  title: 'Intermediary',
  description: 'Intermediary application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/favicon/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/favicon/android-chrome-512x512.png"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <LogRocketInit />
      </body>
    </html>
  );
}
