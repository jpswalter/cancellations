import { DonutChart, List, ListItem } from '@tremor/react';
import { FC } from 'react';
import { StatsResponse } from '@/lib/api/stats';
import clsx from 'clsx';

type Props = {
  saveOfferCounts?: StatsResponse['requests']['saveOfferCounts'];
};

const SaveOffersPieChart: FC<Props> = ({ saveOfferCounts }) => {
  console.log(saveOfferCounts);
  if (!saveOfferCounts) {
    return null;
  }

  const totalOffers = 0;
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

  // Special case: when both accepted and declined are 0
  if (acceptedOffers === 0 && declinedOffers === 0) {
    return (
      <div className="flex flex-col h-full px-2 gap-2 justify-center items-center -mt-8">
        <p className="text-2xl text-gray-500">
          Total: <span>{totalOffers}</span>
        </p>
        {totalOffers === 0 ? (
          <p className="font-bold px-1">No offers have been made yet</p>
        ) : (
          <p className="font-bold px-1">
            No offers have been accepted or declined yet
          </p>
        )}
      </div>
    );
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
          label={String(totalOffers)}
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
