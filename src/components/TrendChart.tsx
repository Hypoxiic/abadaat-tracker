import React, { useMemo } from 'react';
import { Box, useColorModeValue, useToken } from '@chakra-ui/react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { formatShortDate, fromDateKey } from '../lib/dates';
import type { Series } from '../lib/stats';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
);

interface TrendChartProps {
  series: Series;
  label: string;
  type?: 'line' | 'bar';
  /** Hex colour for the dataset. */
  color?: string;
  /** Fixes the y-axis maximum, e.g. 5 for prayers. */
  suggestedMax?: number;
  height?: number;
}

const hexToRgba = (hex: string, alpha: number): string => {
  const normalised = hex.replace('#', '');
  const full =
    normalised.length === 3
      ? normalised
          .split('')
          .map((char) => char + char)
          .join('')
      : normalised;
  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return `rgba(33, 158, 117, ${alpha})`;
  // eslint-disable-next-line no-bitwise
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

/**
 * Chart of a real stored metric.
 *
 * The dashboard previously generated its "historical data" with `Math.random()`
 * on every mount, so the charts showed different numbers each visit and bore no
 * relationship to what the user had tracked.
 */
export const TrendChart: React.FC<TrendChartProps> = ({
  series,
  label,
  type = 'bar',
  color,
  suggestedMax,
  height = 260,
}) => {
  const [brand500, gray400, gray600] = useToken('colors', ['brand.500', 'gray.400', 'gray.600']);
  const accent = color ?? brand500;
  const gridColor = useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.08)');
  const tickColor = useColorModeValue(gray600, gray400);
  const tooltipBg = useColorModeValue('rgba(26,32,44,0.92)', 'rgba(255,255,255,0.94)');
  const tooltipText = useColorModeValue('#ffffff', '#1a202c');

  const labels = useMemo(
    () => series.dates.map((date) => formatShortDate(fromDateKey(date))),
    [series.dates],
  );

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label,
          data: series.values,
          borderColor: accent,
          backgroundColor: type === 'line' ? hexToRgba(accent, 0.16) : hexToRgba(accent, 0.75),
          hoverBackgroundColor: accent,
          borderWidth: type === 'line' ? 2.5 : 0,
          borderRadius: type === 'bar' ? 6 : 0,
          maxBarThickness: 44,
          tension: 0.35,
          fill: type === 'line',
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: accent,
        },
      ],
    }),
    [labels, label, series.values, accent, type],
  );

  const options = useMemo<ChartOptions<'line' | 'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      animation: { duration: 350 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipBg,
          titleColor: tooltipText,
          bodyColor: tooltipText,
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (context) => `${label}: ${context.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: tickColor, font: { size: 11 }, maxRotation: 0, autoSkipPadding: 12 },
        },
        y: {
          beginAtZero: true,
          suggestedMax,
          grid: { color: gridColor },
          border: { display: false },
          ticks: { color: tickColor, font: { size: 11 }, precision: 0, maxTicksLimit: 5 },
        },
      },
    }),
    [gridColor, tickColor, tooltipBg, tooltipText, label, suggestedMax],
  );

  return (
    <Box h={`${height}px`} w="100%" role="img" aria-label={`${label} over the last ${series.dates.length} days`}>
      {type === 'line' ? <Line data={data} options={options} /> : <Bar data={data} options={options} />}
    </Box>
  );
};

export default TrendChart;
