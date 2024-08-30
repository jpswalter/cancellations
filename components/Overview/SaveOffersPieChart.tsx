import { DonutChart, Legend } from '@tremor/react';
import { FC } from 'react';
import { StatsResponse } from '@/lib/api/stats';

type Props = {
  saveOfferCounts?: StatsResponse['requests']['saveOfferCounts'];
};

const SaveOffersPieChart: FC<Props> = ({ saveOfferCounts }) => {
  if (!saveOfferCounts) {
    return null;
  }

  // Convert saveOfferCounts to data format for DonutChart
  const chartData = Object.entries(saveOfferCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize the status
    value: count,
  }));

  const colorMap: { [key: string]: string } = {
    Offered: 'blue',
    Declined: 'rose',
    Accepted: 'lime',
  };

  const colors = chartData.map(data => colorMap[data.name]);

  // Check if there's any data to display
  if (chartData.length === 0) {
    return <div>No save offer data available</div>;
  }

  return (
    <div className="mx-auto space-y-12 flex flex-col items-center justify-center">
      <div className="space-y-3">
        <div className="flex items-center justify-center space-x-6">
          <DonutChart
            data={chartData}
            category="value"
            index="name"
            colors={colors}
            className="w-40"
          />
          <Legend
            categories={chartData.map(item => item.name)}
            className="max-w-xs"
            colors={colors}
          />
        </div>
      </div>
    </div>
  );
};

export default SaveOffersPieChart;
