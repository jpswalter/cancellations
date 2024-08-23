import { DonutChart, Legend } from '@tremor/react';
import { FC } from 'react';
import { Request } from '@/lib/db/schema';

const SaveOffersPieChart: FC<{ requests?: Request[] }> = ({ requests }) => {
  // Define the type for the accumulator
  type SaveStatusCounts = {
    [key: string]: number;
  };

  if (!requests) return null;

  // Process requests to count only "Save" statuses
  const saveStatusCounts: SaveStatusCounts = requests.reduce(
    (acc: SaveStatusCounts, request) => {
      if (request.status.startsWith('Save')) {
        acc[request.status] = (acc[request.status] || 0) + 1;
      }
      return acc;
    },
    {} as SaveStatusCounts,
  );

  // Convert saveStatusCounts to data format for DonutChart
  const chartData = Object.keys(saveStatusCounts).map(status => ({
    name: status,
    value: saveStatusCounts[status],
  }));

  // Define the value formatter
  const valueFormatter = (value: number) => `${value}`;

  return (
    <>
      <div className="mx-auto space-y-12 flex flex-col items-center justify-center">
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-6">
            <DonutChart
              data={chartData}
              category="value"
              index="name"
              valueFormatter={valueFormatter}
              colors={['blue', 'cyan', 'indigo', 'violet', 'lime']}
              className="w-40"
            />
            <Legend
              categories={Object.keys(saveStatusCounts)}
              colors={['blue', 'cyan', 'indigo', 'violet', 'lime']}
              className="max-w-xs"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SaveOffersPieChart;
