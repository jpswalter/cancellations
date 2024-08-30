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
import SourcesCard from './SourcesCard';
import ChartCard from './ChatCard';
import SaveOffersPieChart from './SaveOffersPieChart';
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

    return {
      labels,
      datasets: [
        {
          label: 'Daily Volume',
          data,
          backgroundColor: '#548ea6',
        },
      ],
    };
  }, [stats?.requests.dailyVolume]);

  return (
    <div className="relative flex w-full h-full">
      <Image
        src="/images/purple-gradient.svg"
        layout="fill"
        objectFit="cover"
        quality={100}
        alt="Purple gradient background"
        className="pointer-events-none"
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
              <SaveOffersPieChart
                saveOfferCounts={stats?.requests?.saveOfferCounts}
              />
            </ChartCard>
            <SourcesCard
              data={stats?.requests?.sourceDistribution}
              tenants={stats?.tenants}
              isLoading={isLoading}
            />
          </div>
          <ChartCard
            title="Request Volume by Day"
            fullWidth
            isLoading={isLoading}
          >
            {dailyVolumeData && (
              <Bar options={callsBarChartOptions} data={dailyVolumeData} />
            )}
          </ChartCard>
        </main>
      </div>
    </div>
  );
};

export default Overview;
