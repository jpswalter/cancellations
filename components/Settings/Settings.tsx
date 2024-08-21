'use client';
import clsx from 'clsx';
import { useState } from 'react';
import MyAccountTab from './MyAccountTab';
import { useAuth } from '@/hooks/useAuth';
import { getTenants } from '@/lib/api/tenant';
import { useQuery } from '@tanstack/react-query';
import SaveOffersTab from './SaveOfferTab/SaveOfferTab';
import ProxyFeeAdminTab from './ProxyFeeAdminTab';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('My Account');
  console.log('activeTab', activeTab);
  const { userData } = useAuth();
  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
  });
  const tenant = tenants?.find(t => t.id === userData?.tenantId);
  const isProvider = userData?.tenantType === 'provider';

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const tabs = [
    { name: 'My Account', current: activeTab === 'My Account' },
    {
      name: 'Save Offers',
      current: activeTab === 'Save Offers',
    },
    {
      name: 'Proxy Fee Admin',
      current: activeTab === 'Proxy Fee Admin',
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
                    {tabs.map(tab => (
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
                    ))}
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
                  />
                )}
                {activeTab === 'Proxy Fee Admin' && isProvider && (
                  <ProxyFeeAdminTab />
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
