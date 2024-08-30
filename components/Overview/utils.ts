import { ComponentProps } from 'react';
import { Bar, Line } from 'react-chartjs-2';

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
