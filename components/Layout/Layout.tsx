/* eslint-disable @next/next/no-img-element */
'use client';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import clsx from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import Profile from '../Profile/Profile';
import SidebarButton from '../SidebarButton/SidebarButton';

import { useMenuItems } from './useMenuItems';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, userData } = useAuth();
  const { mainItems, settingsItem } = useMenuItems(userData?.tenantType);

  if (loading || !userData) {
    return null;
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div
        className={clsx(
          'grid h-full w-full grid-rows-[64px_1fr]',
          'grid-cols-[20rem_1fr]',
        )}
      >
        <div
          className={clsx('fixed inset-y-0 z-50 flex flex-col', 'w-[20rem]')}
        >
          <div className="flex grow flex-col border-r border-gray-200 bg-white px-6">
            <img
              src="/images/Logo.svg"
              className="w-60 mt-6 mb-4"
              alt="ProxyLink logo"
            />

            <nav className="mt-3 flex flex-1 flex-col">
              <ul
                role="list"
                className="flex flex-1 flex-col justify-between pb-4"
              >
                <div className="flex flex-col gap-y-2">
                  {mainItems.map(item => (
                    <SidebarButton
                      key={item.link}
                      link={item.link}
                      label={item.label}
                      Icon={item.Icon}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-y-2">
                  <SidebarButton
                    link={settingsItem.link}
                    label={settingsItem.label}
                    Icon={settingsItem.Icon}
                  />
                  {userData && <Profile />}
                </div>
              </ul>
            </nav>
          </div>
        </div>
        <div className="col-start-2 row-span-2 row-start-1">{children}</div>
      </div>
    </>
  );
}
