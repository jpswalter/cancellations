import { FC } from 'react';
import Link from 'next/link';

const Footer: FC = () => {
  return (
    <footer className="bg-blue-600 text-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <p className="mb-4">© 2024 Proxz AI Inc.</p>
        <nav className="flex flex-col sm:flex-row gap-4 sm:gap-2">
          <Link href="#" className="hover:underline">
            Privacy Policy
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link href="#" className="hover:underline">
            Terms of Use
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link href="#" className="hover:underline">
            Your Privacy Choices
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link href="#" className="hover:underline">
            Support
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
