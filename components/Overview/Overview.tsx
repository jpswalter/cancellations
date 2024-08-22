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
import { Bar, Line } from 'react-chartjs-2';
import {
  DateRangePicker,
  SelectItem,
  Select as SelectTremor,
} from '@tremor/react';
import { Metadata } from 'next';
import {
  aggregateRequestsByDate,
  aggregateRequestsByHour,
  callsBarChartOptions,
  freqBarChartOptions,
} from './utils';
import { useAuth } from '@/hooks/useAuth';
import { getRequests } from '@/lib/api/request';
import { useQuery } from '@tanstack/react-query';
import Stats from './Stats';
import Image from 'next/image';
import { getTenants } from '@/lib/api/tenant';
import { Request, Tenant } from '@/lib/db/schema';
import SourcesCard from './SourcesCard';
import ChartCard from './ChatCard';

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

const Overview: React.FC = () => {
  const { userData } = useAuth();
  const { tenantType, tenantId } = userData || {};

  const { data: requests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ['requests', tenantType, tenantId],
    queryFn: () => getRequests(tenantType, tenantId),
    enabled: !!tenantType && !!tenantId,
  });

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
  });

  const sourcesData = useMemo(() => {
    if (!requests || !tenants) return [];

    const sourceMap = new Map<string, number>();
    requests.forEach((request: Request) => {
      const source = request.proxyTenantId;
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    const totalRequests = requests.length;
    const colors = [
      'bg-orange-500',
      'bg-blue-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-gray-500',
    ];

    return Array.from(sourceMap.entries())
      .map(([id, count], index) => {
        const tenant = tenants.find((t: Tenant) => t.id === id);
        return {
          name: tenant ? tenant.name : 'Unknown',
          amount: count,
          share: `${((count / totalRequests) * 100).toFixed(1)}%`,
          color: colors[index % colors.length],
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [requests, tenants]);

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
        <header className="flex h-[72px] items-center gap-2 border-b bg-white/80 px-5 backdrop-blur-sm">
          <h1 className="text-2xl font-bold">Overview</h1>
          <div className="flex-1" />
          <DateRangePicker className="w-30" />
          <SelectTremor enableClear={false} className="w-52" defaultValue="1">
            <SelectItem value="1">All Sources</SelectItem>
          </SelectTremor>
          <SelectTremor enableClear={false} className="w-52" defaultValue="1">
            <SelectItem value="1">All Request Types</SelectItem>
          </SelectTremor>
        </header>
        <main className="flex-1 overflow-auto p-5 space-y-5">
          <Stats requests={requests} />
          <ChartCard title="Request Volume by Day" fullWidth>
            <Bar
              options={callsBarChartOptions}
              data={aggregateRequestsByDate(requests)}
            />
          </ChartCard>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Avg Request Volume by Time of the Day">
              <Line
                options={freqBarChartOptions}
                data={aggregateRequestsByHour(requests)}
              />
            </ChartCard>
            <SourcesCard data={sourcesData} isLoading={isRequestsLoading} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Overview;
