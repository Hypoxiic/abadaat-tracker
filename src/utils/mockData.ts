import { format, subDays } from 'date-fns';

/**
 * Generates mock historical data for the last N days
 * @param days Number of days to generate data for
 * @param min Minimum value for random data
 * @param max Maximum value for random data
 * @param trend 'up' | 'down' | 'stable' | 'random' - general trend of the data
 * @returns Array of data points and array of date labels
 */
export const generateMockHistoricalData = (
  days: number = 7,
  min: number = 0,
  max: number = 5,
  trend: 'up' | 'down' | 'stable' | 'random' = 'random'
): { data: number[]; labels: string[] } => {
  const data: number[] = [];
  const labels: string[] = [];

  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), days - 1 - i);
    labels.push(format(date, 'MMM d'));

    let value: number;
    
    switch (trend) {
      case 'up':
        // Gradually increasing trend with some randomness
        value = min + ((max - min) * i / (days - 1)) + (Math.random() * (max - min) / 4);
        break;
      case 'down':
        // Gradually decreasing trend with some randomness
        value = max - ((max - min) * i / (days - 1)) + (Math.random() * (max - min) / 4);
        break;
      case 'stable':
        // Stable trend with minor fluctuations
        const midpoint = (max + min) / 2;
        value = midpoint + (Math.random() * (max - min) / 4) - (max - min) / 8;
        break;
      case 'random':
      default:
        // Completely random values
        value = min + Math.random() * (max - min);
        break;
    }

    // Round to nearest integer or to 1 decimal place for smaller ranges
    data.push(max - min > 10 ? Math.round(value) : Math.round(value * 10) / 10);
  }

  return { data, labels };
};

/**
 * Generates mock prayer completion data for the last N days
 * @param days Number of days to generate data for
 * @returns Array of prayer completion counts (0-5) and array of date labels
 */
export const generateMockPrayerData = (days: number = 7): { data: number[]; labels: string[] } => {
  return generateMockHistoricalData(days, 0, 5, 'stable');
};

/**
 * Generates mock Quran reading data for the last N days
 * @param days Number of days to generate data for
 * @returns Array of pages read and array of date labels
 */
export const generateMockQuranData = (days: number = 7): { data: number[]; labels: string[] } => {
  return generateMockHistoricalData(days, 0, 20, 'up');
};

/**
 * Generates mock Dhikr count data for the last N days
 * @param days Number of days to generate data for
 * @returns Array of dhikr counts and array of date labels
 */
export const generateMockDhikrData = (days: number = 7): { data: number[]; labels: string[] } => {
  return generateMockHistoricalData(days, 10, 100, 'random');
};

/**
 * Generates mock Dua completion data for the last N days
 * @param days Number of days to generate data for
 * @returns Array of dua completion counts and array of date labels
 */
export const generateMockDuaData = (days: number = 7): { data: number[]; labels: string[] } => {
  return generateMockHistoricalData(days, 0, 10, 'stable');
}; 