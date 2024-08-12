import { Roboto } from 'next/font/google';
import Header from './components/Header';
import Footer from './components/Footer';
import { Metadata } from 'next';

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Streamline Third-Party Customer Support',
  description:
    "ProxyLink allows you to quickly and securely resolve customer support requests submitted by third-parties ('Proxies') on behalf of your customers.",
  openGraph: {
    title: 'Streamline Third-Party Customer Support',
    description:
      "ProxyLink allows you to quickly and securely resolve customer support requests submitted by third-parties ('Proxies') on behalf of your customers.",
    images: [
      {
        url: 'https://proxylink.co/images/ProxyLink_banner.png', // Replace with your actual domain
        width: 1200,
        height: 630,
        alt: 'ProxyLink Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Streamline Third-Party Customer Support',
    description:
      "ProxyLink allows you to quickly and securely resolve customer support requests submitted by third-parties ('Proxies') on behalf of your customers.",
    images: ['https://proxylink.co/images/ProxyLink_banner.png'], // Replace with your actual domain
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${roboto.className} min-h-screen flex flex-col`}>
      <Header />
      <div className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
