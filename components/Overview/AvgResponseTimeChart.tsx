import React, { useMemo } from 'react';
import { DonutChart, List, ListItem } from '@tremor/react';
import clsx from 'clsx';
import Spinner from '../ui/spinner';
import { RequestWithLog } from '@/lib/db/schema';

const AvgResponseTimeChart: React.FC<{
  requests: RequestWithLog[];
  isLoading: boolean;
}> = ({ requests, isLoading }) => {
  const chartData = useMemo(() => {
    if (isLoading) return [];

    const tiers = [
      { name: '0-3h', max: 3, color: 'bg-green-500' },
      { name: '3-6h', max: 6, color: 'bg-yellow-500' },
      { name: '6-12h', max: 12, color: 'bg-orange-500' },
      { name: '12-24h', max: 24, color: 'bg-red-500' },
      { name: '24h+', max: Infinity, color: 'bg-purple-500' },
    ];

    const tierCounts = tiers.map(tier => ({ ...tier, count: 0 }));

    requests.forEach(request => {
      const avgTime = request.log.avgResponseTime.provider.hours;
      const tierIndex = tiers.findIndex(tier => avgTime < tier.max);
      if (tierIndex !== -1) {
        tierCounts[tierIndex].count++;
      }
    });

    const total = requests.length;
    return tierCounts.map(tier => ({
      name: tier.name,
      amount: tier.count,
      share: `${((tier.count / total) * 100).toFixed(1)}%`,
      color: tier.color,
    }));
  }, [requests, isLoading]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-5">
      <h2 className="text-lg font-medium pl-2">Average Response Time</h2>

      {isLoading ? (
        <div className="flex items-center justify-center h-full w-full">
          <Spinner className="border-amber-300 w-36 h-36" />
        </div>
      ) : (
        <div className="flex gap-5 pt-8">
          <div className="basis-1/2 h-full flex flex-col justify-center">
            <DonutChart
              data={chartData}
              category="amount"
              index="name"
              colors={['green', 'yellow', 'orange', 'red', 'purple']}
              variant="donut"
              showAnimation={true}
            />
          </div>
          <div className="basis-1/2 h-full flex flex-col justify-center">
            <List>
              {chartData.map(item => (
                <ListItem key={item.name} className="space-x-6">
                  <div className="flex items-center space-x-2.5 truncate">
                    <span
                      className={clsx(
                        item.color,
                        'h-2.5 w-2.5 shrink-0 rounded-sm',
                      )}
                      aria-hidden={true}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium tabular-nums">
                      {item.amount}
                    </span>
                    <span className="rounded-sm bg-gray-100 px-1.5 py-0.5 text-xs font-medium tabular-nums">
                      {item.share}
                    </span>
                  </div>
                </ListItem>
              ))}
            </List>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvgResponseTimeChart;
