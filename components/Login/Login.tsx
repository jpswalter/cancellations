// file: app/login/page.tsx
'use client';
import { FaCheckCircle } from 'react-icons/fa';
import LoginForm from '@/components/Login/LoginForm';
import { FC } from 'react';
import ResetForm from './ResetForm';

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
    <div className="bg-blue-900 relative h-screen w-screen">
      <div className="absolute z-20 flex h-screen w-screen flex-col justify-center overflow-y-auto">
        <div className="flex flex-1 justify-center px-14">
          {/* Left Explanatory */}
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="mb-6 flex max-w-[640px] flex-1 flex-col justify-center gap-6">
              <div>
                <h1 className="text-7xl font-bold text-white mb-2">
                  ProxyLink
                </h1>
                <div className="text-3xl font-medium text-white/85">
                  Streamline 3rd-Party Customer Support
                </div>
              </div>
              <div className="flex">
                <div className="mr-2 mt-1">
                  <FaCheckCircle className="text-blue-200 text-xl" />
                </div>
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
              <div className="flex">
                <div className="mr-2 mt-1">
                  <FaCheckCircle className="text-blue-200 text-xl" />
                </div>
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
                <div className="mr-2 mt-1">
                  <FaCheckCircle className="text-blue-200 text-xl" />
                </div>
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

          {/* Right Explanatory */}
          <div className="mx-auto flex flex-1 flex-col items-center justify-center p-4">
            {renderLoginComponent()}
          </div>
        </div>
        {/* Top Nav */}
        <div className="flex items-center gap-5 p-10 font-medium text-white/70">
          <div className="flex-1" />
          <div>© 2024 Intermediary.cc. All Rights Reserved.</div>
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
};

export default Login;
