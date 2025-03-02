import { PrayerTimesData } from './prayerTimes';
import { format, parse, addMinutes, differenceInMinutes, set } from 'date-fns';

// This file contains utility functions to parse the Milton Keynes timing data
// and calculate prayer times based on astronomical twilight data

// Interface for the parsed CSV data
interface DayData {
  date: string; // Format: 'YYYY-MM-DD'
  month: string;
  day: number;
  sunrise: string;
  sunset: string;
  fajrStart: string; // Nautical twilight start
  ishaEnd: string;   // Nautical twilight end
  dhuhrTime: string; // Solar noon
}

// Extended interface to include solar midnight
export interface ExtendedPrayerTimesData extends PrayerTimesData {
  solarMidnight: string;
  sunset: string;
}

// Function to clean time strings from the CSV (removes degree symbols and other non-time characters)
const cleanTimeString = (timeStr: string): string => {
  if (!timeStr) return '';
  // Extract just the time part (e.g., "06:48" from "06:48?(101)")
  const match = timeStr.match(/(\d{2}:\d{2})/);
  return match ? match[1] : '';
};

// Parse the CSV data into a structured format
export const parseTimingData = (): DayData[] => {
  // In a real implementation, we would read the CSV file
  // For now, we'll hardcode a subset of the data for demonstration
  
  // Sample data for March and April 2025 (first few days)
  const sampleData: DayData[] = [
    {
      date: '2025-03-01',
      month: 'Mar',
      day: 1,
      sunrise: '06:48',
      sunset: '17:42',
      fajrStart: '05:35', // Nautical twilight start
      ishaEnd: '18:56',   // Nautical twilight end
      dhuhrTime: '12:15'  // Solar noon
    },
    {
      date: '2025-03-02',
      month: 'Mar',
      day: 2,
      sunrise: '06:46',
      sunset: '17:44',
      fajrStart: '05:33',
      ishaEnd: '18:57',
      dhuhrTime: '12:15'
    },
    {
      date: '2025-03-03',
      month: 'Mar',
      day: 3,
      sunrise: '06:44',
      sunset: '17:46',
      fajrStart: '05:31',
      ishaEnd: '18:59',
      dhuhrTime: '12:14'
    },
    {
      date: '2025-03-04',
      month: 'Mar',
      day: 4,
      sunrise: '06:41',
      sunset: '17:48',
      fajrStart: '05:29',
      ishaEnd: '19:01',
      dhuhrTime: '12:14'
    },
    {
      date: '2025-03-05',
      month: 'Mar',
      day: 5,
      sunrise: '06:39',
      sunset: '17:50',
      fajrStart: '05:26',
      ishaEnd: '19:03',
      dhuhrTime: '12:14'
    },
    // Add more days as needed
  ];
  
  return sampleData;
};

// Calculate solar midnight (opposite of solar noon)
const calculateSolarMidnight = (solarNoonTime: string): string => {
  try {
    const solarNoon = parse(solarNoonTime, 'HH:mm', new Date());
    
    // Solar midnight is 12 hours from solar noon
    // If solar noon is 12:15, solar midnight would be 00:15
    const solarMidnight = addMinutes(solarNoon, 12 * 60);
    
    return format(solarMidnight, 'HH:mm');
  } catch (error) {
    console.error('Error calculating solar midnight:', error);
    return '00:15'; // Default fallback
  }
};

// Function to get prayer times for the current date
export const getMiltonKeynesPrayerTimes = (): ExtendedPrayerTimesData => {
  try {
    // Get the current date
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
    const currentDay = today.getDate();
    
    // Parse the timing data
    const timingData = parseTimingData();
    
    // Find the closest date in our data
    // In a real implementation, we would find the exact date
    // For now, we'll just use the first entry as a placeholder
    const todayData = timingData[0];
    
    // Calculate prayer times based on astronomical data
    
    // Fajr: Nautical twilight start
    const fajrTime = todayData.fajrStart;
    
    // Sunrise
    const sunriseTime = todayData.sunrise;
    
    // Dhuhr: Solar noon
    const dhuhrTime = todayData.dhuhrTime;
    
    // Solar midnight (opposite of solar noon)
    const solarMidnightTime = calculateSolarMidnight(dhuhrTime);
    
    // Parse times to Date objects for calculations
    const dhuhrDate = parse(dhuhrTime, 'HH:mm', new Date());
    const sunsetDate = parse(todayData.sunset, 'HH:mm', new Date());
    const solarMidnightDate = parse(solarMidnightTime, 'HH:mm', new Date());
    
    // Asr: Midpoint between Dhuhr and sunset
    const dhuhrToSunsetMinutes = differenceInMinutes(sunsetDate, dhuhrDate);
    const asrDate = addMinutes(dhuhrDate, Math.floor(dhuhrToSunsetMinutes / 2));
    
    // Maghrib: 20 minutes after sunset
    const maghribDate = addMinutes(sunsetDate, 20);
    
    // Isha: Midpoint between sunset and solar midnight
    // If solar midnight is on the next day, we need to adjust
    let adjustedSolarMidnightDate = solarMidnightDate;
    if (format(solarMidnightDate, 'HH:mm') < format(sunsetDate, 'HH:mm')) {
      // Solar midnight is on the next day, add 24 hours
      adjustedSolarMidnightDate = addMinutes(solarMidnightDate, 24 * 60);
    }
    
    const sunsetToMidnightMinutes = differenceInMinutes(adjustedSolarMidnightDate, sunsetDate);
    const ishaDate = addMinutes(sunsetDate, Math.floor(sunsetToMidnightMinutes / 2));
    
    // Sunset (directly from data)
    const sunsetTime = todayData.sunset;
    
    // Format times in 12-hour format with am/pm
    return {
      fajr: format(parse(fajrTime, 'HH:mm', new Date()), 'h:mm a'),
      sunrise: format(parse(sunriseTime, 'HH:mm', new Date()), 'h:mm a'),
      dhuhr: format(dhuhrDate, 'h:mm a'),
      asr: format(asrDate, 'h:mm a'),
      maghrib: format(maghribDate, 'h:mm a'),
      isha: format(ishaDate, 'h:mm a'),
      solarMidnight: format(solarMidnightDate, 'h:mm a'),
      sunset: format(parse(sunsetTime, 'HH:mm', new Date()), 'h:mm a')
    };
  } catch (error) {
    console.error('Error calculating Milton Keynes prayer times:', error);
    
    // Return fallback data in case of error
    return {
      fajr: '5:15 am',
      sunrise: '6:45 am',
      dhuhr: '12:30 pm',
      asr: '3:45 pm',
      maghrib: '6:50 pm',
      isha: '8:00 pm',
      solarMidnight: '12:15 am',
      sunset: '5:42 pm'
    };
  }
};

// Function to get today's date in a readable format
export const getTodayDateString = (): string => {
  return format(new Date(), 'EEEE, MMMM do, yyyy');
}; 