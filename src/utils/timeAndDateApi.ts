import { format } from 'date-fns';
import { PrayerTimesData } from './prayerTimes';

// API configuration
const API_BASE_URL = 'https://api.timeanddate.com/v3';
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
const API_SECRET = 'YOUR_API_SECRET'; // Replace with your actual API secret

// Interface for location input
export interface LocationInput {
  city: string;
  country?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Function to generate API signature
const generateSignature = (endpoint: string, params: Record<string, string>): string => {
  // In a real implementation, this would use crypto libraries to generate HMAC signature
  // For demo purposes, we're just returning a placeholder
  return 'generated_signature';
};

// Function to fetch sun data from timeanddate.com API
export const fetchSunData = async (location: LocationInput): Promise<any> => {
  try {
    // Prepare parameters
    const params: Record<string, string> = {
      key: API_KEY,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      version: '3',
    };
    
    // Add location parameters
    if (location.coordinates) {
      params.latitude = location.coordinates.latitude.toString();
      params.longitude = location.coordinates.longitude.toString();
    } else {
      params.place = location.city;
      if (location.country) {
        params.country = location.country;
      }
    }
    
    // Generate signature
    const endpoint = '/astronomy/sun';
    const signature = generateSignature(endpoint, params);
    params.sig = signature;
    
    // Build query string
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}${endpoint}?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sun data:', error);
    throw error;
  }
};

// Function to calculate prayer times based on sun data
export const calculatePrayerTimesFromSunData = async (location: LocationInput): Promise<PrayerTimesData> => {
  try {
    // Fetch sun data from API
    const sunData = await fetchSunData(location);
    
    // Extract relevant sun events
    // In a real implementation, we would parse the API response
    // For demo purposes, we're using placeholder logic
    
    // Calculate prayer times based on sun events
    // These calculations would use the actual sun data in a real implementation
    
    // For Fajr: Dawn/nautical twilight (sun is 12° below horizon)
    // For Dhuhr: Solar noon
    // For Asr: When shadow length equals object height plus shadow length at noon
    // For Maghrib: Sunset
    // For Isha: Dusk/astronomical twilight (sun is 18° below horizon)
    
    // Format times
    const formatTime = (date: Date): string => {
      return format(date, 'h:mm a');
    };
    
    // In a real implementation, we would calculate these times based on the API response
    // For now, we're using the current time to generate sample times
    const now = new Date();
    const fajrTime = new Date(now);
    fajrTime.setHours(5, Math.floor(Math.random() * 30), 0);
    
    const sunriseTime = new Date(now);
    sunriseTime.setHours(6, Math.floor(Math.random() * 30), 0);
    
    const dhuhrTime = new Date(now);
    dhuhrTime.setHours(12, Math.floor(Math.random() * 30), 0);
    
    const asrTime = new Date(now);
    asrTime.setHours(15, Math.floor(Math.random() * 30), 0);
    
    const maghribTime = new Date(now);
    maghribTime.setHours(18, Math.floor(Math.random() * 30), 0);
    
    const ishaTime = new Date(now);
    ishaTime.setHours(19, Math.floor(Math.random() * 30), 0);
    
    return {
      fajr: formatTime(fajrTime),
      sunrise: formatTime(sunriseTime),
      dhuhr: formatTime(dhuhrTime),
      asr: formatTime(asrTime),
      maghrib: formatTime(maghribTime),
      isha: formatTime(ishaTime)
    };
  } catch (error) {
    console.error('Error calculating prayer times:', error);
    throw error;
  }
};

// Function to geocode a location (city/country) to coordinates
export const geocodeLocation = async (city: string, country?: string): Promise<{latitude: number, longitude: number}> => {
  try {
    // In a real implementation, this would call the timeanddate.com geospatial API
    // For demo purposes, we're returning hardcoded coordinates
    
    // Sample coordinates for common cities
    const coordinates: Record<string, {latitude: number, longitude: number}> = {
      'london': {latitude: 51.5074, longitude: -0.1278},
      'new york': {latitude: 40.7128, longitude: -74.0060},
      'mecca': {latitude: 21.4225, longitude: 39.8262},
      'karachi': {latitude: 24.8607, longitude: 67.0011},
      'mumbai': {latitude: 19.0760, longitude: 72.8777},
      'istanbul': {latitude: 41.0082, longitude: 28.9784},
      'cairo': {latitude: 30.0444, longitude: 31.2357},
      'kuala lumpur': {latitude: 3.1390, longitude: 101.6869},
      'jakarta': {latitude: -6.2088, longitude: 106.8456},
      'toronto': {latitude: 43.6532, longitude: -79.3832}
    };
    
    const normalizedCity = city.toLowerCase().trim();
    
    if (coordinates[normalizedCity]) {
      return coordinates[normalizedCity];
    }
    
    // Default coordinates if city not found
    return {latitude: 0, longitude: 0};
  } catch (error) {
    console.error('Error geocoding location:', error);
    throw error;
  }
};

// Main function to get prayer times for a location
export const getPrayerTimes = async (city: string, country?: string): Promise<PrayerTimesData> => {
  try {
    // First, geocode the location to get coordinates
    const coordinates = await geocodeLocation(city, country);
    
    // Then calculate prayer times using the coordinates
    const prayerTimes = await calculatePrayerTimesFromSunData({
      city,
      country,
      coordinates
    });
    
    return prayerTimes;
  } catch (error) {
    console.error('Error getting prayer times:', error);
    
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