import { ChartData } from 'chart.js';
import { ComponentProps } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Request } from '@/lib/db/schema';

export const callsBarChartOptions: ComponentProps<typeof Bar>['options'] = {
  plugins: {
    title: {
      display: false,
      text: 'Chart.js Bar Chart - Stacked',
    },
    legend: {
      display: true,
      onClick() {},
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
      grid: {
        display: false,
      },
    },
  },
};

export const freqBarChartOptions: ComponentProps<typeof Line>['options'] = {
  plugins: {
    legend: {
      display: true,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      // stacked: false,
      title: {
        display: true,
        text: 'Time of Day',
      },
    },
    y: {
      // stacked: false,
      title: {
        display: true,
        text: 'Number of Requests',
      },
      ticks: {
        stepSize: 1,
      },
    },
  },
};

export function aggregateRequestsByDate(
  requests: Request[] | undefined,
  days: number = 30,
): ChartData<'bar', number[], string> {
  if (!requests) return { labels: [], datasets: [] };
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days + 1);

  const dateLabels: string[] = [];
  const requestCounts: number[] = new Array(days).fill(0);

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    dateLabels.push(
      currentDate.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
      }),
    );
  }

  requests.forEach(request => {
    const requestDate = new Date(request.dateSubmitted);
    if (requestDate >= startDate && requestDate <= endDate) {
      const dayIndex = Math.floor(
        (requestDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      requestCounts[dayIndex]++;
    }
  });

  return {
    labels: dateLabels,
    datasets: [
      {
        label: 'Requests',
        data: requestCounts,
        backgroundColor: '#548ea6',
      },
    ],
  };
}

export const aggregateRequestsByHour = (requests: Request[] | undefined) => {
  if (!requests) return { labels: [], datasets: [] };

  const hourlyData = Array(24).fill(0);

  requests?.forEach(request => {
    const hour = new Date(request.dateSubmitted).getHours();
    hourlyData[hour]++;
  });

  return {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Average Requests',
        data: hourlyData,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };
};
