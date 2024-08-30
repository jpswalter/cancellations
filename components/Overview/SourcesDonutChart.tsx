import React from 'react';
import { DonutChart, List, ListItem } from '@tremor/react';
import clsx from 'clsx';
import { StatsResponse } from '@/lib/api/stats';

interface SourcesCardProps {
  data?: Record<string, number>;
  tenants?: StatsResponse['tenants'];
}

const SourcesDonutChart: React.FC<SourcesCardProps> = ({ data, tenants }) => {
  if (!data) {
    return null;
  }

  const totalRequests = Object.values(data).reduce(
    (sum, count) => sum + count,
    0,
  );

  const colorClasses = [
    'bg-orange-500',
    'bg-blue-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-gray-500',
  ];

  const formattedData = Object.entries(data).map(([tenantId, count], index) => {
    const tenant = tenants?.find(t => t.id === tenantId);
    return {
      name: tenant?.name || tenantId,
      amount: count,
      share: `${((count / totalRequests) * 100).toFixed(1)}%`,
      color: colorClasses[index % colorClasses.length],
    };
  });

  return (
    <div className="flex gap-5">
      <div className="basis-1/2 h-full flex justify-center">
        <DonutChart
          data={formattedData}
          category="amount"
          index="name"
          colors={['orange', 'blue', 'red', 'purple', 'gray']}
          variant="donut"
          showAnimation={true}
        />
      </div>
      <div className="basis-1/2 h-full flex justify-center">
        <List>
          {formattedData.map(item => (
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
                <span className="font-medium tabular-nums">{item.amount}</span>
                <span className="rounded-sm bg-gray-100 px-1.5 py-0.5 text-xs font-medium tabular-nums">
                  {item.share}
                </span>
              </div>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

export default SourcesDonutChart;
