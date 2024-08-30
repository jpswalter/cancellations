import React, { FC } from 'react';
import { DonutChart } from '@tremor/react';
import { StatsResponse } from '@/lib/api/stats';
import { Loader } from '@/components/ui/spinner';

type Props = {
  stats?: StatsResponse['requests'];
  isLoading?: boolean;
};

const Stats: FC<Props> = ({ stats, isLoading }) => {
  const resolvedRequestsCount =
    Number(stats?.statusCounts['Canceled']) +
    Number(stats?.statusCounts['Save Confirmed']);

  const declinedRequestsCount = stats?.statusCounts['Declined'];
  const saveOffersCount = stats?.saveOfferCounts.offered;

  const statsItems = [
    { name: 'Requests', stat: stats?.totalCount },
    { name: 'Save Offers', stat: saveOffersCount },
    {
      name: 'Canceled',
      stat: resolvedRequestsCount,
      donut: (
        <DonutChart
          data={[
            { amount: resolvedRequestsCount },
            { amount: Number(stats?.totalCount) - resolvedRequestsCount },
          ]}
          category="amount"
          index="name"
          className="h-14 w-14"
          showLabel={false}
          showTooltip={false}
          colors={['blue', 'slate-200']}
        />
      ),
    },
    {
      name: 'Declined',
      stat: declinedRequestsCount,
      donut: (
        <DonutChart
          data={[
            { amount: declinedRequestsCount },
            {
              amount: Number(stats?.totalCount) - Number(declinedRequestsCount),
            },
          ]}
          category="amount"
          index="name"
          className="h-14 w-14"
          showLabel={false}
          showTooltip={false}
          colors={['blue', 'slate-200']}
        />
      ),
    },
    { name: 'Avg Service Level', stat: `${stats?.averageResponseTime} days` },
  ];

  return (
    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-5">
      {statsItems.map(item => (
        <div
          key={item.name}
          className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
        >
          <div className="flex items-center">
            <div className="flex-1">
              <dt className="truncate text-sm font-medium text-gray-500">
                {item.name}
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {isLoading ? (
                  <Loader className="w-12 h-12 text-gray-500" />
                ) : (
                  item.stat
                )}
              </dd>
            </div>
            <div className="">{item.donut}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
