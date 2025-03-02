import React from 'react';
import {
  Box,
  useColorModeValue,
  useColorMode,
} from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface HistoricalDataChartProps {
  type: 'line' | 'bar';
  title: string;
  data: number[];
  labels?: string[];
  days?: number;
  color?: string;
}

const HistoricalDataChart: React.FC<HistoricalDataChartProps> = ({
  type = 'line',
  title,
  data,
  labels,
  days = 7,
  color,
}) => {
  const { colorMode } = useColorMode();
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColor = useColorModeValue('gray.200', 'gray.700');
  
  // Generate labels for the last N days if not provided
  const generatedLabels = labels || Array.from({ length: days }, (_, i) => {
    return format(subDays(new Date(), days - 1 - i), 'MMM d');
  });

  // Ensure data length matches labels length
  const paddedData = data.length < generatedLabels.length
    ? [...data, ...Array(generatedLabels.length - data.length).fill(0)]
    : data.slice(0, generatedLabels.length);

  const chartData = {
    labels: generatedLabels,
    datasets: [
      {
        label: title,
        data: paddedData,
        borderColor: color || 'rgba(76, 175, 80, 1)',
        backgroundColor: color ? `${color}33` : 'rgba(76, 175, 80, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: type === 'line',
      },
    ],
  };

  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          font: {
            family: '"Open Sans", sans-serif',
          },
        },
      },
      title: {
        display: true,
        text: title,
        color: textColor,
        font: {
          family: '"Noto Sans", sans-serif',
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: colorMode === 'dark' ? 'rgba(26, 32, 44, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: colorMode === 'dark' ? 'white' : 'black',
        bodyColor: colorMode === 'dark' ? 'white' : 'black',
        borderColor: gridColor,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: {
            family: '"Open Sans", sans-serif',
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: {
            family: '"Open Sans", sans-serif',
          },
        },
      },
    },
  };

  return (
    <Box h="300px" w="100%" p={2}>
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </Box>
  );
};

export default HistoricalDataChart; 