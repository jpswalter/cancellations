import React, { FC, useMemo } from 'react';
import { Request } from '@/lib/db/schema';
import { DonutChart } from '@tremor/react';

type Props = {
  requests?: Request[];
};
const Stats: FC<Props> = ({ requests }) => {
  const uniqueSourcesCount = useMemo(() => {
    return new Set(requests?.map(request => request.proxyTenantId)).size;
  }, [requests]);

  const resolvedRequestsCount = requests?.filter(
    request =>
      request.status === 'Canceled' || request.status === 'Save Confirmed',
  ).length;

  const declinedRequestsCount = requests?.filter(
    request => request.status === 'Declined',
  ).length;

  const averageTimeToRespondDays = useMemo(() => {
    if (!requests) return 0;

    const totalResponseTimeDays = requests.reduce((acc, request) => {
      if (request.dateResponded) {
        const responseTimeMs =
          new Date(request.dateResponded).getTime() -
          new Date(request.dateSubmitted).getTime();
        return acc + responseTimeMs / (1000 * 60 * 60 * 24); // Convert to days
      }
      return acc;
    }, 0);

    const respondedRequestsCount = requests.filter(
      request => request.dateResponded,
    ).length;

    const average =
      respondedRequestsCount > 0
        ? totalResponseTimeDays / respondedRequestsCount
        : 0;
    return Math.round(average * 10) / 10; // Round to 0.1
  }, [requests]);

  const stats = useMemo(
    () => [
      { name: 'Requests', stat: requests?.length },
      {
        name: 'Unique Sources',
        stat: uniqueSourcesCount,
      },
      {
        name: 'Resolved',
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
        name: 'Declined',
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
      { name: 'Avg Service Level', stat: `${averageTimeToRespondDays} days` },
    ],
    [
      requests,
      uniqueSourcesCount,
      resolvedRequestsCount,
      declinedRequestsCount,
      averageTimeToRespondDays,
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
