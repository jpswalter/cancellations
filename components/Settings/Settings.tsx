'use client';
import clsx from 'clsx';
import { useState } from 'react';
import MyAccountTab from './MyAccountTab';
import MyTeamTab from './MyTeamTab';
import { useAuth } from '@/hooks/useAuth';
import { getTenant } from '@/lib/api/tenant';
import { useQuery } from '@tanstack/react-query';
import SaveOffersTab from './SaveOfferTab/SaveOfferTab';
import ProxyFeeAdminTab from './ProxyFeeAdminTab';

const Settings: React.FC<{ tenantId: string }> = ({ tenantId }) => {
  const [activeTab, setActiveTab] = useState('My Account');

  const { userData } = useAuth();
  const isAdmin = userData?.role === 'admin';
  const { data: tenant, refetch } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => getTenant(tenantId),
    staleTime: 0,
  });
  const isProvider = userData?.tenantType === 'provider';

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const tabs = [
    {
      name: 'My Account',
      current: activeTab === 'My Account',
      isEnabled: true,
    },
    {
      name: 'My Team',
      current: activeTab === 'My Team',
      isEnabled: isAdmin,
    },
    {
      name: 'Save Offers',
      current: activeTab === 'Save Offers',
      isEnabled: isProvider && isAdmin,
    },
    {
      name: 'Proxy Fee Admin',
      current: activeTab === 'Proxy Fee Admin',
      isEnabled: isProvider && isAdmin,
    },
  ];

  if (!userData) return null;

  return (
    <div className="flex w-full">
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <div className="flex h-[72px] flex-none items-center border-b bg-white px-[20px]">
          <div className="text-[24px] font-bold">Settings</div>
        </div>
        <div className="">
          <div className="mx-auto w-full px-4">
            <div className="mb-10 mt-6 overflow-hidden border bg-white shadow sm:rounded-lg">
              <div className="p-6">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => {
                      if (!tab.isEnabled) return null;
                      return (
                        <div
                          key={tab.name}
                          onClick={() => handleTabClick(tab.name)}
                          className={clsx(
                            tab.current
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                            'cursor-pointer whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                          )}
                          aria-current={tab.current ? 'page' : undefined}
                        >
                          {tab.name}
                        </div>
                      );
                    })}
                  </nav>
                </div>
                {activeTab === 'My Account' && (
                  <MyAccountTab userData={userData} tenantName={tenant?.name} />
                )}
                {activeTab === 'Save Offers' && isProvider && (
                  <SaveOffersTab
                    isAdmin={userData?.role === 'admin'}
                    offers={tenant?.saveOffers}
                    tenantId={userData?.tenantId}
                    refetch={refetch}
                  />
                )}
                {activeTab === 'Proxy Fee Admin' && isProvider && (
                  <ProxyFeeAdminTab />
                )}
                {activeTab === 'My Team' && isAdmin && (
                  <MyTeamTab tenantId={tenantId} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
