import { useEffect, useMemo, useState } from 'react';
import { resolveLocation } from '../data/locations';
import {
  getNextPrayer,
  getPrayerTimes,
  getCurrentPrayer,
} from '../lib/prayerTimes';
import type { PrayerTimes, PrayerTimesOptions, UpcomingPrayer } from '../lib/prayerTimes';
import type { GeoLocation, PrayerKey, Settings } from '../lib/types';
import { useSettings } from './appState';

/** A ticking clock. `intervalMs` defaults to one second. */
export const useNow = (intervalMs = 1000): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (intervalMs <= 0) return undefined;
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
};

export const settingsToOptions = (settings: Settings): PrayerTimesOptions => ({
  location: resolveLocation(settings.locationId, settings.customLocation),
  method: settings.method,
  asrMadhab: settings.asrMadhab,
  highLatitudeRule: settings.highLatitudeRule,
  adjustments: settings.adjustments,
  midnightMode: settings.midnightMode,
});

export interface UsePrayerTimesResult {
  times: PrayerTimes;
  next: UpcomingPrayer;
  current: PrayerKey | null;
  location: GeoLocation;
  options: PrayerTimesOptions;
  now: Date;
}

/**
 * Prayer times for a given date (defaults to today), recomputed when the
 * settings or the date change, with a live "next prayer" countdown.
 */
export const usePrayerTimes = (date?: Date): UsePrayerTimesResult => {
  const settings = useSettings();
  const now = useNow(1000);
  const target = date ?? now;
  // Only recompute when the calendar day changes, not every tick.
  const dayStamp = `${target.getFullYear()}-${target.getMonth()}-${target.getDate()}`;

  const options = useMemo(() => settingsToOptions(settings), [settings]);
  const location = options.location as GeoLocation;

  const times = useMemo(
    () => getPrayerTimes(target, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dayStamp, options],
  );

  const minuteStamp = Math.floor(now.getTime() / 60000);
  const next = useMemo(
    () => getNextPrayer(now, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [minuteStamp, options],
  );

  const current = useMemo(
    () => getCurrentPrayer(now, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [minuteStamp, options],
  );

  return { times, next, current, location, options, now };
};
