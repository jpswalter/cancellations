// file: app/login/page.tsx
// file: app/login/page.tsx
'use client';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import LoginForm from '@/components/Login/LoginForm';
import { FC } from 'react';
import ResetForm from './ResetForm';
import Link from 'next/link';
import { Button } from '@headlessui/react';
import Footer from '@/app/(public)/components/Footer';
type Props = {
  type?: 'reset-password' | 'sign-up';
};

const Login: FC<Props> = ({ type }) => {
  const renderLoginComponent = () => {
    if (type === 'reset-password') {
      return <ResetForm />;
    }
    return <LoginForm />;
  };

  return (
    <div className="bg-blue-900 relative h-screen w-screen p-4 flex flex-col">
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center">
        <div>
          <div className="my-6">
            <Link href="/">
              <Button className="text-white flex items-center gap-2 mb-2">
                <FaArrowLeft color="white" /> Back
              </Button>
            </Link>
            <Link href="/">
              <h1 className="text-5xl font-bold text-white mb-2">ProxyLink</h1>
            </Link>
            <div className="text-2xl font-medium text-white/85">
              Streamline 3rd-Party Customer Support
            </div>
          </div>

          {/* Text Section for Desktop */}
          <div className="hidden md:block mb-6 max-w-[640px]">
            <div className="flex mb-6">
              <FaCheckCircle className="text-blue-200 text-xl mr-2 mt-1" />
              <div>
                <div className="text-xl font-semibold text-white/85">
                  Enhance Security
                </div>
                <div className="text-lg text-white/60">
                  Ensure that all requests submitted by a proxy are authorized
                  by your customer.
                </div>
              </div>
            </div>
            <div className="flex mb-6">
              <FaCheckCircle className="text-blue-200 text-xl mr-2 mt-1" />
              <div>
                <div className="text-xl font-semibold text-white/85">
                  Efficiently Resolve Tickets
                </div>
                <div className="text-lg text-white/60">
                  The ProxyLink dashboard makes it faster to resolve tickets
                  submitted by a proxy.
                </div>
              </div>
            </div>
            <div className="flex">
              <FaCheckCircle className="text-blue-200 text-xl mr-2 mt-1" />
              <div>
                <div className="text-xl font-semibold text-white/85">
                  Visualize Trends
                </div>
                <div className="text-lg text-white/60">
                  Access dashboards to see data trends and charts, helping you
                  grasp insights at a glance.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login/Reset Form */}
        <div className="md:max-w-[480px] w-full">{renderLoginComponent()}</div>
      </div>
      <Footer bgClassName="bg-blue-900" />
    </div>
  );
};

export default Login;
