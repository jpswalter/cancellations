/* eslint-disable @next/next/no-img-element */
'use client';
import React from 'react';
import { FaChartSimple, FaFileCsv } from 'react-icons/fa6';
import { BsListUl } from 'react-icons/bs';
import { MdOutlineAssignmentTurnedIn } from 'react-icons/md';
import { Toaster } from 'react-hot-toast';
import clsx from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import Profile from '../Profile/Profile';
import SidebarButton from '../SidebarButton/SidebarButton';
import { FaCog } from 'react-icons/fa';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, userData } = useAuth();
  const isProvider = userData?.tenantType === 'provider';

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
              alt="Intermediary logo"
            />

            <nav className="mt-3 flex flex-1 flex-col">
              <ul
                role="list"
                className="flex flex-1 flex-col gap-y-5 justify-between pb-4"
              >
                <div className="flex flex-col gap-y-2">
                  {isProvider && (
                    <SidebarButton
                      link="/overview"
                      label="Overview"
                      Icon={FaChartSimple}
                      activePaths={[
                        '/overview-customer-support',
                        '/overview-refunds',
                      ]}
                    />
                  )}
                  <SidebarButton
                    link="/actions"
                    label="Actions Needed"
                    Icon={MdOutlineAssignmentTurnedIn}
                  />
                  <SidebarButton
                    link="/requests"
                    label="All Requests"
                    Icon={BsListUl}
                  />
                  <SidebarButton
                    link="/upload"
                    label="Upload CSV"
                    Icon={FaFileCsv}
                    hideButton={userData?.tenantType === 'provider'}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <SidebarButton
                    link="/settings"
                    label="Settings"
                    Icon={FaCog}
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
