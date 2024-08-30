import { DonutChart, List, ListItem } from '@tremor/react';
import { FC } from 'react';
import { StatsResponse } from '@/lib/api/stats';
import clsx from 'clsx';

type Props = {
  saveOfferCounts?: StatsResponse['requests']['saveOfferCounts'];
};

const SaveOffersPieChart: FC<Props> = ({ saveOfferCounts }) => {
  if (!saveOfferCounts) {
    return null;
  }

  const totalOffers = saveOfferCounts.offered;
  const acceptedOffers = saveOfferCounts.accepted;
  const declinedOffers = saveOfferCounts.declined;

  const formattedData = [
    { name: 'Accepted', amount: acceptedOffers, color: 'bg-lime-500' },
    { name: 'Declined', amount: declinedOffers, color: 'bg-rose-500' },
  ];

  const chartData = [
    { name: 'Accepted', value: acceptedOffers },
    { name: 'Declined', value: declinedOffers },
  ];

  const colors = ['lime', 'rose'];

  // Check if there's any data to display
  if (totalOffers === 0) {
    return <div>No save offers made</div>;
  }

  return (
    <div className="flex gap-5">
      <div className="basis-1/2 h-full flex justify-center">
        <DonutChart
          data={chartData}
          category="value"
          index="name"
          colors={colors}
          className="w-40"
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
                  {((item.amount / totalOffers) * 100).toFixed(1)}%
                </span>
              </div>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

export default SaveOffersPieChart;
