import React, { FC, useMemo } from 'react';
import { RequestWithLog } from '@/lib/db/schema';
import { DonutChart } from '@tremor/react';

type Props = {
  requests?: RequestWithLog[];
};
const Stats: FC<Props> = ({ requests }) => {
  const resolvedRequestsCount = requests?.filter(
    request =>
      request.status === 'Canceled' || request.status === 'Save Confirmed',
  ).length;

  const declinedRequestsCount = requests?.filter(
    request => request.status === 'Declined',
  ).length;

  const averageTimeToRespondHours = useMemo(() => {
    if (!requests || requests.length === 0) return 0;
    const totalTime = requests.reduce((acc, request) => {
      return acc + (request.log?.avgResponseTime?.provider?.hours || 0);
    }, 0);
    return (totalTime / requests.length).toFixed(1);
  }, [requests]);

  const saveOffersCount = requests?.filter(
    request =>
      request.status === 'Save Accepted' || request.status === 'Save Confirmed',
  ).length;

  const stats = useMemo(
    () => [
      { name: 'Requests', stat: requests?.length },
      {
        name: 'Canceled',
        stat: resolvedRequestsCount,
        donut: (
          <DonutChart
            data={[
              { amount: Number(requests?.length) },
              {
                amount:
                  Number(requests?.length) - Number(resolvedRequestsCount),
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
      {
        name: 'Invalid',
        stat: declinedRequestsCount,
        donut: (
          <DonutChart
            data={[
              { amount: declinedRequestsCount },
              {
                amount:
                  Number(requests?.length) - Number(declinedRequestsCount),
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
      {
        name: 'Save Offers Accepted',
        stat: saveOffersCount,
      },
      {
        name: 'Avg. Response Time',
        stat: `${averageTimeToRespondHours} hours`,
      },
    ],
    [
      requests,
      saveOffersCount,
      resolvedRequestsCount,
      declinedRequestsCount,
      averageTimeToRespondHours,
    ],
  );

  if (!requests) return null;

  return (
    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-5">
      {stats.map(item => (
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
                {item.stat}
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
