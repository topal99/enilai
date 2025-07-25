"use client";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface PieChartProps {
  chartData: {
    labels: string[];
    data: number[];
  };
}

export const PieChart = ({ chartData }: PieChartProps) => {
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Jumlah Pengguna',
        data: chartData.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={data} options={{ plugins: { title: { display: true, text: 'Komposisi Pengguna' }}}} />;
};