import { DonutChart, List, ListItem } from '@tremor/react';
import clsx from 'clsx';
import Spinner from '../ui/spinner';

const SourcesCard: React.FC<{
  data: {
    name: string;
    amount: number;
    share: string;
    color: string;
  }[];
  isLoading: boolean;
}> = ({ data, isLoading }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-5">
    <h2 className="text-lg font-medium">Sources</h2>

    {isLoading ? (
      <div className="flex items-center justify-center h-full w-full">
        <Spinner className="border-amber-300 w-36 h-36" />
      </div>
    ) : (
      <div className="flex justify-center gap-5 h-full">
        <div className="basis-1/2 h-full flex flex-col justify-center">
          <DonutChart
            data={data}
            category="amount"
            index="name"
            colors={['orange', 'blue', 'red', 'purple', 'gray']}
            variant="donut"
            showAnimation={true}
          />
        </div>
        <div className="basis-1/2 h-full flex flex-col justify-center">
          <p className="text-tremor-label text-tremor-content flex items-center justify-between mb-2">
            <span>Category</span>
            <span>Amount / Share</span>
          </p>
          <List>
            {data.map(item => (
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

export default SourcesCard;
