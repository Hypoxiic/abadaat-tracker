import type { GeoLocation } from '../lib/types';

/**
 * Preset locations. The previous version only supported Milton Keynes (with
 * hard-coded March 2025 sun data); prayer times are now computed for any
 * coordinates, so this list is purely a convenience.
 */
export const PRESET_LOCATIONS: GeoLocation[] = [
  {
    id: 'milton-keynes',
    name: 'Milton Keynes',
    country: 'United Kingdom',
    latitude: 52.0406,
    longitude: -0.7594,
    timeZone: 'Europe/London',
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    timeZone: 'Europe/London',
  },
  {
    id: 'birmingham',
    name: 'Birmingham',
    country: 'United Kingdom',
    latitude: 52.4862,
    longitude: -1.8904,
    timeZone: 'Europe/London',
  },
  {
    id: 'manchester',
    name: 'Manchester',
    country: 'United Kingdom',
    latitude: 53.4808,
    longitude: -2.2426,
    timeZone: 'Europe/London',
  },
  {
    id: 'glasgow',
    name: 'Glasgow',
    country: 'United Kingdom',
    latitude: 55.8642,
    longitude: -4.2518,
    timeZone: 'Europe/London',
  },
  {
    id: 'dublin',
    name: 'Dublin',
    country: 'Ireland',
    latitude: 53.3498,
    longitude: -6.2603,
    timeZone: 'Europe/Dublin',
  },
  {
    id: 'najaf',
    name: 'Najaf',
    country: 'Iraq',
    latitude: 32.0009,
    longitude: 44.3301,
    timeZone: 'Asia/Baghdad',
  },
  {
    id: 'karbala',
    name: 'Karbala',
    country: 'Iraq',
    latitude: 32.6160,
    longitude: 44.0249,
    timeZone: 'Asia/Baghdad',
  },
  {
    id: 'qom',
    name: 'Qom',
    country: 'Iran',
    latitude: 34.6416,
    longitude: 50.8746,
    timeZone: 'Asia/Tehran',
  },
  {
    id: 'mashhad',
    name: 'Mashhad',
    country: 'Iran',
    latitude: 36.2605,
    longitude: 59.6168,
    timeZone: 'Asia/Tehran',
  },
  {
    id: 'tehran',
    name: 'Tehran',
    country: 'Iran',
    latitude: 35.6892,
    longitude: 51.3890,
    timeZone: 'Asia/Tehran',
  },
  {
    id: 'makkah',
    name: 'Makkah',
    country: 'Saudi Arabia',
    latitude: 21.4225,
    longitude: 39.8262,
    timeZone: 'Asia/Riyadh',
  },
  {
    id: 'madinah',
    name: 'Madinah',
    country: 'Saudi Arabia',
    latitude: 24.5247,
    longitude: 39.5692,
    timeZone: 'Asia/Riyadh',
  },
  {
    id: 'damascus',
    name: 'Damascus',
    country: 'Syria',
    latitude: 33.5138,
    longitude: 36.2765,
    timeZone: 'Asia/Damascus',
  },
  {
    id: 'beirut',
    name: 'Beirut',
    country: 'Lebanon',
    latitude: 33.8938,
    longitude: 35.5018,
    timeZone: 'Asia/Beirut',
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    country: 'Turkey',
    latitude: 41.0082,
    longitude: 28.9784,
    timeZone: 'Europe/Istanbul',
  },
  {
    id: 'cairo',
    name: 'Cairo',
    country: 'Egypt',
    latitude: 30.0444,
    longitude: 31.2357,
    timeZone: 'Africa/Cairo',
  },
  {
    id: 'karachi',
    name: 'Karachi',
    country: 'Pakistan',
    latitude: 24.8607,
    longitude: 67.0011,
    timeZone: 'Asia/Karachi',
  },
  {
    id: 'lahore',
    name: 'Lahore',
    country: 'Pakistan',
    latitude: 31.5204,
    longitude: 74.3587,
    timeZone: 'Asia/Karachi',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    timeZone: 'Asia/Kolkata',
  },
  {
    id: 'delhi',
    name: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    timeZone: 'Asia/Kolkata',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    latitude: 25.2048,
    longitude: 55.2708,
    timeZone: 'Asia/Dubai',
  },
  {
    id: 'kuala-lumpur',
    name: 'Kuala Lumpur',
    country: 'Malaysia',
    latitude: 3.1390,
    longitude: 101.6869,
    timeZone: 'Asia/Kuala_Lumpur',
  },
  {
    id: 'jakarta',
    name: 'Jakarta',
    country: 'Indonesia',
    latitude: -6.2088,
    longitude: 106.8456,
    timeZone: 'Asia/Jakarta',
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.0060,
    timeZone: 'America/New_York',
  },
  {
    id: 'chicago',
    name: 'Chicago',
    country: 'United States',
    latitude: 41.8781,
    longitude: -87.6298,
    timeZone: 'America/Chicago',
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    country: 'United States',
    latitude: 34.0522,
    longitude: -118.2437,
    timeZone: 'America/Los_Angeles',
  },
  {
    id: 'toronto',
    name: 'Toronto',
    country: 'Canada',
    latitude: 43.6532,
    longitude: -79.3832,
    timeZone: 'America/Toronto',
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    timeZone: 'Australia/Sydney',
  },
];

export const DEFAULT_LOCATION_ID = 'milton-keynes';

export const CUSTOM_LOCATION_ID = 'custom';

export const findPresetLocation = (id: string): GeoLocation | undefined =>
  PRESET_LOCATIONS.find((location) => location.id === id);

/** Resolve the location a settings object points at, always returning something usable. */
export const resolveLocation = (
  locationId: string,
  customLocation: GeoLocation | null,
): GeoLocation => {
  if (locationId === CUSTOM_LOCATION_ID && customLocation) return customLocation;
  return (
    findPresetLocation(locationId) ??
    findPresetLocation(DEFAULT_LOCATION_ID) ??
    PRESET_LOCATIONS[0]
  );
};

/** Best-effort guess of the user's city from their browser timezone. */
export const guessLocationFromTimeZone = (): GeoLocation | undefined => {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return PRESET_LOCATIONS.find((location) => location.timeZone === zone);
  } catch {
    return undefined;
  }
};
