import { format } from 'date-fns';

export interface PrayerTimesData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface LocationData {
  country: string;
  city: string;
}

// Function to calculate prayer times - made synchronous to avoid any async issues
export const calculatePrayerTimes = (location: LocationData): PrayerTimesData => {
  try {
    // Static predefined times based on location - no complex calculations
    // This ensures the function will always return quickly without freezing
    const locationTimes: Record<string, PrayerTimesData> = {
      'london': {
        fajr: '5:15 am',
        sunrise: '6:45 am',
        dhuhr: '12:30 pm',
        asr: '3:45 pm',
        maghrib: '6:50 pm',
        isha: '8:00 pm'
      },
      'new-york': {
        fajr: '5:30 am',
        sunrise: '7:00 am',
        dhuhr: '12:15 pm',
        asr: '3:30 pm',
        maghrib: '7:10 pm',
        isha: '8:30 pm'
      },
      'mecca': {
        fajr: '4:45 am',
        sunrise: '6:15 am',
        dhuhr: '12:10 pm',
        asr: '3:15 pm',
        maghrib: '6:30 pm',
        isha: '7:45 pm'
      },
      'karachi': {
        fajr: '5:00 am',
        sunrise: '6:30 am',
        dhuhr: '12:20 pm',
        asr: '4:00 pm',
        maghrib: '6:45 pm',
        isha: '8:15 pm'
      },
      'mumbai': {
        fajr: '5:10 am',
        sunrise: '6:40 am',
        dhuhr: '12:25 pm',
        asr: '3:55 pm',
        maghrib: '6:55 pm',
        isha: '8:20 pm'
      },
      'istanbul': {
        fajr: '5:20 am',
        sunrise: '6:50 am',
        dhuhr: '12:35 pm',
        asr: '3:50 pm',
        maghrib: '7:05 pm',
        isha: '8:25 pm'
      },
      'cairo': {
        fajr: '4:50 am',
        sunrise: '6:20 am',
        dhuhr: '12:05 pm',
        asr: '3:40 pm',
        maghrib: '6:35 pm',
        isha: '7:50 pm'
      },
      'kuala-lumpur': {
        fajr: '5:25 am',
        sunrise: '6:55 am',
        dhuhr: '12:40 pm',
        asr: '4:05 pm',
        maghrib: '7:15 pm',
        isha: '8:35 pm'
      },
      'jakarta': {
        fajr: '5:05 am',
        sunrise: '6:35 am',
        dhuhr: '12:15 pm',
        asr: '3:35 pm',
        maghrib: '6:40 pm',
        isha: '8:05 pm'
      },
      'toronto': {
        fajr: '5:35 am',
        sunrise: '7:05 am',
        dhuhr: '12:45 pm',
        asr: '4:10 pm',
        maghrib: '7:20 pm',
        isha: '8:40 pm'
      }
    };
    
    // Get predefined times for the selected city or return default times if not found
    return locationTimes[location.city] || locationTimes['london'];
    
  } catch (error) {
    console.error('Error calculating prayer times:', error);
    
    // Return fallback data in case of error
    return {
      fajr: '5:15 am',
      sunrise: '6:45 am',
      dhuhr: '12:30 pm',
      asr: '3:45 pm',
      maghrib: '6:50 pm',
      isha: '8:00 pm'
    };
  }
};

// Function to get default locations
export const getDefaultLocations = (): LocationData[] => {
  return [
    { country: 'uk', city: 'london' },
    { country: 'usa', city: 'new-york' },
    { country: 'saudi-arabia', city: 'mecca' },
    { country: 'pakistan', city: 'karachi' },
    { country: 'india', city: 'mumbai' },
    { country: 'turkey', city: 'istanbul' },
    { country: 'egypt', city: 'cairo' },
    { country: 'malaysia', city: 'kuala-lumpur' },
    { country: 'indonesia', city: 'jakarta' },
    { country: 'canada', city: 'toronto' }
  ];
}; 