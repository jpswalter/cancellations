'use client';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Metadata } from 'next';
import { useQuery } from '@tanstack/react-query';
import Stats from './Stats';
import Image from 'next/image';
import SourcesDonutChart from './SourcesDonutChart';
import ChartCard from './ChatCard';
import SaveOffersDonutChart from './SaveOffersDonutChart';
import { fetchStats } from '@/lib/api/stats';
import { TenantType } from '@/lib/db/schema';
import { callsBarChartOptions } from './utils';

export const metadata: Metadata = {
  title: 'Overview',
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineController,
  LineElement,
  Filler,
);

const Overview: React.FC<{ tenantType: TenantType; tenantId: string }> = ({
  tenantType,
  tenantId,
}) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats', tenantType, tenantId],
    queryFn: () => fetchStats(tenantType, tenantId),
    enabled: !!tenantType && !!tenantId,
  });

  const dailyVolumeData = useMemo(() => {
    if (!stats?.requests.dailyVolume) return null;

    const labels = Object.keys(stats.requests.dailyVolume);
    const data = Object.values(stats.requests.dailyVolume);

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);

    return {
      labels,
      datasets: [
        {
          label: 'Daily Volume',
          data,
          backgroundColor: '#548ea6',
        },
      ],
      maxValue,
      minValue,
    };
  }, [stats?.requests.dailyVolume]);

  return (
    <div className="relative flex w-full h-full">
      <Image
        src="/images/purple-gradient.svg"
        fill={true}
        quality={100}
        alt="Purple gradient background"
        className="pointer-events-none"
        style={{ objectFit: 'cover' }}
      />
      <div className="flex flex-col w-full h-full z-10">
        <header className="z-40 flex h-[72px] items-center justify-between gap-2 border-b bg-white/80 px-5 backdrop-blur-sm">
          <h1 className="text-2xl font-bold flex-1">Overview</h1>
          {/* <Filters {...filters} showStatusFilter={false} /> */}
        </header>
        <main className="flex-1 overflow-auto p-5 space-y-5 z-30">
          <Stats stats={stats?.requests} isLoading={isLoading} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Save Offers" isLoading={isLoading}>
              <SaveOffersDonutChart
                saveOfferCounts={stats?.requests?.saveOfferCounts}
              />
            </ChartCard>
            <ChartCard title="Sources" isLoading={isLoading}>
              <SourcesDonutChart
                data={stats?.requests?.sourceDistribution}
                tenants={stats?.tenants}
              />
            </ChartCard>
          </div>
          <ChartCard
            title="Request Volume by Day"
            fullWidth
            isLoading={isLoading}
          >
            {dailyVolumeData ? (
              dailyVolumeData.maxValue === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">
                    No requests in the current period.
                  </p>
                </div>
              ) : (
                <Bar options={callsBarChartOptions} data={dailyVolumeData} />
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </ChartCard>
        </main>
      </div>
    </div>
  );
};

export default Overview;
