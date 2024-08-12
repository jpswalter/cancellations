import { Roboto } from 'next/font/google';
import Header from './components/Header';
import Footer from './components/Footer';

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

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
