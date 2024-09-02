// components/ui/timeline.tsx
import React from 'react';
import clsx from 'clsx';

export interface TimelineItemProps {
  id: string;
  content: React.ReactNode;
  date: string;
  side: 'left' | 'right';
  borderClass: string;
  status?: React.ReactNode;
  isLast?: boolean;
  dotAlignment: 'top' | 'center';
}

interface TimelineProps {
  items: TimelineItemProps[];
  dotAlignment?: 'top' | 'center';
  titles: { id: string; type: 'proxy' | 'provider'; name: string }[];
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  content,
  date,
  side,
  borderClass,
  dotAlignment = 'top',
  status,
  isLast,
}) => (
  <div
    className={clsx(
      'flex items-start mb-8',
      side === 'left' ? 'flex-row-reverse' : '',
      isLast && 'relative', // Add relative positioning to the last item
    )}
  >
    <div
      className={clsx(
        'flex-1 flex flex-col gap-2',
        side === 'left' ? 'text-right pl-4' : 'pr-4',
      )}
    >
      {status && (
        <div
          className={clsx(
            side === 'left'
              ? 'text-left pl-3 justify-start'
              : 'text-right pr-3 justify-end',
            'flex',
          )}
        >
          {status}
        </div>
      )}
      <div
        className={clsx(
          '',
          side === 'left' ? 'pl-4  text-left' : 'pr-4 text-right',
        )}
      >
        {content}
      </div>
      <div
        className={clsx(
          'text-sm text-gray-500',
          side === 'left' ? 'pl-4 text-left' : 'pr-4 text-right',
        )}
      >
        {date}
      </div>
    </div>
    <div
      className={clsx(
        `w-4 h-4 rounded-full bg-white ${borderClass} border-4 z-10`,
        {
          'self-start mt-1.5': dotAlignment === 'top' && !isLast,
          'self-center': dotAlignment === 'center',
          'mr-4': side === 'right',
          'ml-4': side === 'left',
        },
      )}
    />
    {isLast && (
      <div
        className="absolute left-1/2 bottom-0 w-1 bg-white transform -translate-x-1/2"
        style={{
          height: 'calc(100% - 10px)',
        }}
      />
    )}
    <div className="flex-1" />
  </div>
);

const VerticalLine: React.FC = () => (
  <div
    className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform -translate-x-1/2"
    style={{
      bottom: '2px',
    }}
  />
);

export const Timeline: React.FC<TimelineProps> = ({
  items,
  dotAlignment = 'top',
  titles,
}) => {
  const tenantsColorMap = {
    proxy: 'text-blue-500',
    provider: 'text-purple-600',
  };

  return (
    <div className="relative">
      <div className="flex justify-between mb-8">
        {titles.map(title => (
          <div
            key={title.id}
            className={`w-1/2 text-center font-bold ${tenantsColorMap[title.type]}`}
          >
            {title.name}
          </div>
        ))}
      </div>
      <VerticalLine />
      {items.map((item, index) => (
        <TimelineItem
          key={item.id}
          {...item}
          dotAlignment={index === items.length - 1 ? 'top' : dotAlignment}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
};
