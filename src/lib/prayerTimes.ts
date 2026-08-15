/**
 * Astronomical prayer time calculation.
 *
 * This replaces the previous implementation, which returned hard-coded times
 * per city (and, in one code path, times generated with `Math.random()`).
 *
 * The algorithm follows the standard approach used by PrayTimes: compute the
 * sun's declination and the equation of time for the day, then solve for the
 * hour angle at which the sun reaches a given altitude.
 *
 * All angles are in degrees; all intermediate times are in decimal hours of
 * *local standard time at the location*, which is then converted to absolute
 * `Date` instants using the location's IANA timezone.
 */

import type {
  AsrMadhab,
  CalculationMethodKey,
  GeoLocation,
  HighLatitudeRule,
  MidnightMode,
  PrayerKey,
} from './types';

/* ------------------------------------------------------------------ */
/* Degree-based trigonometry helpers                                    */
/* ------------------------------------------------------------------ */

const dtr = (d: number) => (d * Math.PI) / 180;
const rtd = (r: number) => (r * 180) / Math.PI;

const sin = (d: number) => Math.sin(dtr(d));
const cos = (d: number) => Math.cos(dtr(d));
const tan = (d: number) => Math.tan(dtr(d));
const arcsin = (x: number) => rtd(Math.asin(x));
const arccos = (x: number) => rtd(Math.acos(x));
const arctan2 = (y: number, x: number) => rtd(Math.atan2(y, x));
const arccot = (x: number) => rtd(Math.atan(1 / x));

/** Wrap a value into `[0, range)`. */
export const fixRange = (value: number, range: number): number => {
  let v = value - range * Math.floor(value / range);
  if (v < 0) v += range;
  return v;
};

const fixAngle = (a: number) => fixRange(a, 360);
const fixHour = (h: number) => fixRange(h, 24);

/* ------------------------------------------------------------------ */
/* Calculation methods                                                  */
/* ------------------------------------------------------------------ */

export interface MethodParams {
  /** Sun angle below the horizon for Fajr. */
  fajrAngle: number;
  /**
   * Maghrib definition. `angle` uses the sun's depression angle (the Shia
   * position); `minutes` uses a fixed offset after sunset.
   */
  maghrib: { type: 'angle'; value: number } | { type: 'minutes'; value: number };
  isha: { type: 'angle'; value: number } | { type: 'minutes'; value: number };
  midnight: MidnightMode;
}

export interface CalculationMethod extends MethodParams {
  key: CalculationMethodKey;
  name: string;
  description: string;
}

export const CALCULATION_METHODS: Record<CalculationMethodKey, CalculationMethod> = {
  jafari: {
    key: 'jafari',
    name: "Ja'fari (Shia Ithna-Ashari)",
    description: 'Fajr 16°, Maghrib 4°, Isha 14°. Islamic midnight measured from sunset to Fajr.',
    fajrAngle: 16,
    maghrib: { type: 'angle', value: 4 },
    isha: { type: 'angle', value: 14 },
    midnight: 'jafari',
  },
  tehran: {
    key: 'tehran',
    name: 'Institute of Geophysics, Tehran',
    description: 'Fajr 17.7°, Maghrib 4.5°, Isha 14°.',
    fajrAngle: 17.7,
    maghrib: { type: 'angle', value: 4.5 },
    isha: { type: 'angle', value: 14 },
    midnight: 'jafari',
  },
  mwl: {
    key: 'mwl',
    name: 'Muslim World League',
    description: 'Fajr 18°, Isha 17°. Maghrib at sunset.',
    fajrAngle: 18,
    maghrib: { type: 'minutes', value: 0 },
    isha: { type: 'angle', value: 17 },
    midnight: 'standard',
  },
  isna: {
    key: 'isna',
    name: 'Islamic Society of North America',
    description: 'Fajr 15°, Isha 15°. Maghrib at sunset.',
    fajrAngle: 15,
    maghrib: { type: 'minutes', value: 0 },
    isha: { type: 'angle', value: 15 },
    midnight: 'standard',
  },
  egypt: {
    key: 'egypt',
    name: 'Egyptian General Authority of Survey',
    description: 'Fajr 19.5°, Isha 17.5°.',
    fajrAngle: 19.5,
    maghrib: { type: 'minutes', value: 0 },
    isha: { type: 'angle', value: 17.5 },
    midnight: 'standard',
  },
  makkah: {
    key: 'makkah',
    name: 'Umm al-Qura, Makkah',
    description: 'Fajr 18.5°, Isha 90 minutes after Maghrib.',
    fajrAngle: 18.5,
    maghrib: { type: 'minutes', value: 0 },
    isha: { type: 'minutes', value: 90 },
    midnight: 'standard',
  },
  karachi: {
    key: 'karachi',
    name: 'University of Islamic Sciences, Karachi',
    description: 'Fajr 18°, Isha 18°.',
    fajrAngle: 18,
    maghrib: { type: 'minutes', value: 0 },
    isha: { type: 'angle', value: 18 },
    midnight: 'standard',
  },
};

export const CALCULATION_METHOD_LIST = Object.values(CALCULATION_METHODS);

/* ------------------------------------------------------------------ */
/* Solar position                                                       */
/* ------------------------------------------------------------------ */

/** Julian day number for a Gregorian calendar date (at 00:00 UT). */
export const julianDate = (year: number, month: number, day: number): number => {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5
  );
};

export interface SunPosition {
  /** Sun declination in degrees. */
  declination: number;
  /** Equation of time in hours. */
  equation: number;
}

/** Low-precision solar coordinates (accurate to well under a minute of time). */
export const sunPosition = (jd: number): SunPosition => {
  const d = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const q = fixAngle(280.459 + 0.98564736 * d);
  const l = fixAngle(q + 1.915 * sin(g) + 0.02 * sin(2 * g));
  const e = 23.439 - 0.00000036 * d;

  const ra = fixRange(arctan2(cos(e) * sin(l), cos(l)) / 15, 24);
  const equation = q / 15 - ra;
  const declination = arcsin(sin(e) * sin(l));

  return { declination, equation: fixRange(equation + 12, 24) - 12 };
};

/** Local mean time of solar noon, in decimal hours. */
const midDay = (jd: number, t: number): number => fixHour(12 - sunPosition(jd + t).equation);

/**
 * Time at which the sun reaches the given altitude (`-angle` below horizon).
 * `direction` 'ccw' returns the morning occurrence, 'cw' the evening one.
 * Returns `NaN` when the sun never reaches that altitude (polar regions).
 */
const sunAngleTime = (
  jd: number,
  latitude: number,
  angle: number,
  t: number,
  direction: 'ccw' | 'cw',
): number => {
  const { declination } = sunPosition(jd + t);
  const noon = midDay(jd, t);
  const numerator = -sin(angle) - sin(declination) * sin(latitude);
  const denominator = cos(declination) * cos(latitude);
  const ratio = numerator / denominator;
  if (ratio > 1 || ratio < -1) return NaN;
  const hourAngle = arccos(ratio) / 15;
  return noon + (direction === 'ccw' ? -hourAngle : hourAngle);
};

/** Asr time using the given shadow factor (1 = standard, 2 = Hanafi). */
const asrTime = (jd: number, latitude: number, factor: number, t: number): number => {
  const { declination } = sunPosition(jd + t);
  const angle = -arccot(factor + tan(Math.abs(latitude - declination)));
  return sunAngleTime(jd, latitude, angle, t, 'cw');
};

/* ------------------------------------------------------------------ */
/* High latitude adjustment                                             */
/* ------------------------------------------------------------------ */

/** Portion of the night used by a high-latitude rule. */
const nightPortion = (rule: HighLatitudeRule, angle: number, night: number): number => {
  switch (rule) {
    case 'angleBased':
      return (1 / 60) * angle * night;
    case 'middleOfNight':
      return night / 2;
    case 'seventhOfNight':
      return night / 7;
    default:
      return night;
  }
};

/**
 * Pull `time` back towards `base` so that it is no more than `portion` away.
 * Used to keep Fajr/Isha sane where twilight never ends.
 */
const adjustHighLatitude = (
  time: number,
  base: number,
  portion: number,
  direction: 'ccw' | 'cw',
): number => {
  const diff = direction === 'ccw' ? fixHour(base - time) : fixHour(time - base);
  if (Number.isNaN(time) || diff > portion) {
    return direction === 'ccw' ? base - portion : base + portion;
  }
  return time;
};

/* ------------------------------------------------------------------ */
/* Timezone helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * UTC offset, in hours, that `timeZone` is at the given instant.
 * Falls back to the runtime's local offset for an unknown timezone.
 */
export const timeZoneOffsetHours = (timeZone: string, at: Date): number => {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const parts = dtf.formatToParts(at);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
    const asUtc = Date.UTC(
      get('year'),
      get('month') - 1,
      get('day'),
      get('hour'),
      get('minute'),
      get('second'),
    );
    // Round to the nearest minute to absorb sub-second formatting drift.
    return Math.round((asUtc - at.getTime()) / 60000) / 60;
  } catch {
    return -at.getTimezoneOffset() / 60;
  }
};

/**
 * The zone's UTC offset on a given calendar date, sampled at local noon so it
 * reflects that day's daylight-saving state.
 */
export const zoneOffsetForDate = (
  timeZone: string,
  year: number,
  month: number,
  day: number,
): number =>
  timeZoneOffsetHours(timeZone, new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));

/** Calendar Y/M/D of `at` as observed in `timeZone`. */
export const calendarPartsInZone = (
  timeZone: string,
  at: Date,
): { year: number; month: number; day: number } => {
  try {
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = dtf.formatToParts(at);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
    return { year: get('year'), month: get('month'), day: get('day') };
  } catch {
    return { year: at.getFullYear(), month: at.getMonth() + 1, day: at.getDate() };
  }
};

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

export const TIME_KEYS = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'sunset',
  'maghrib',
  'isha',
  'midnight',
] as const;
export type TimeKey = (typeof TIME_KEYS)[number];

export interface PrayerTimesOptions {
  location: Pick<GeoLocation, 'latitude' | 'longitude' | 'timeZone'>;
  method: CalculationMethodKey;
  asrMadhab: AsrMadhab;
  highLatitudeRule: HighLatitudeRule;
  /** Optional per-prayer correction in minutes. */
  adjustments?: Partial<Record<PrayerKey, number>>;
  /** Overrides the method's midnight convention when provided. */
  midnightMode?: MidnightMode;
}

/** Decimal hours (local standard time at the location) for each event. */
export type RawTimes = Record<TimeKey, number>;

/** Absolute instants for each event. */
export type PrayerTimes = Record<TimeKey, Date>;

const DEFAULT_ESTIMATES: RawTimes = {
  fajr: 5,
  sunrise: 6,
  dhuhr: 12,
  asr: 13,
  sunset: 18,
  maghrib: 18,
  isha: 18,
  midnight: 0,
};

/**
 * Compute raw event times in decimal hours of local standard time.
 * Exported for testing; most callers want {@link getPrayerTimes}.
 */
export const computeRawTimes = (date: Date, options: PrayerTimesOptions): RawTimes => {
  const { location, asrMadhab, highLatitudeRule } = options;
  const method = CALCULATION_METHODS[options.method] ?? CALCULATION_METHODS.jafari;
  const { latitude, longitude, timeZone } = location;

  const { year, month, day } = calendarPartsInZone(timeZone, date);
  const jd = julianDate(year, month, day) - longitude / (15 * 24);

  const asrFactor = asrMadhab === 'hanafi' ? 2 : 1;

  // Two refinement passes are enough for sub-second convergence.
  let times: RawTimes = { ...DEFAULT_ESTIMATES };
  for (let pass = 0; pass < 2; pass += 1) {
    const t = (hours: number) => hours / 24;
    const next: RawTimes = {
      fajr: sunAngleTime(jd, latitude, method.fajrAngle, t(times.fajr), 'ccw'),
      sunrise: sunAngleTime(jd, latitude, riseSetAngle(0), t(times.sunrise), 'ccw'),
      dhuhr: midDay(jd, t(times.dhuhr)),
      asr: asrTime(jd, latitude, asrFactor, t(times.asr)),
      sunset: sunAngleTime(jd, latitude, riseSetAngle(0), t(times.sunset), 'cw'),
      maghrib: NaN,
      isha: NaN,
      midnight: 0,
    };

    next.maghrib =
      method.maghrib.type === 'angle'
        ? sunAngleTime(jd, latitude, method.maghrib.value, t(times.maghrib), 'cw')
        : next.sunset + method.maghrib.value / 60;

    next.isha =
      method.isha.type === 'angle'
        ? sunAngleTime(jd, latitude, method.isha.value, t(times.isha), 'cw')
        : next.maghrib + method.isha.value / 60;

    times = next;
  }

  // High-latitude corrections: keep Fajr and Isha inside the night.
  const night = fixHour(times.sunrise - times.sunset);
  if (highLatitudeRule !== 'none') {
    times.fajr = adjustHighLatitude(
      times.fajr,
      times.sunrise,
      nightPortion(highLatitudeRule, method.fajrAngle, night),
      'ccw',
    );
    const ishaAngle = method.isha.type === 'angle' ? method.isha.value : 18;
    times.isha = adjustHighLatitude(
      times.isha,
      times.sunset,
      nightPortion(highLatitudeRule, ishaAngle, night),
      'cw',
    );
    if (method.maghrib.type === 'angle') {
      times.maghrib = adjustHighLatitude(
        times.maghrib,
        times.sunset,
        nightPortion(highLatitudeRule, method.maghrib.value, night),
        'cw',
      );
    }
  }

  // Islamic midnight. Ja'fari measures sunset -> Fajr; the standard convention
  // measures sunset -> sunrise.
  const midnightMode = options.midnightMode ?? method.midnight;
  const endOfNight = midnightMode === 'jafari' ? times.fajr : times.sunrise;
  times.midnight = times.sunset + fixHour(endOfNight - times.sunset) / 2;

  // Everything so far is mean solar time at the prime meridian. Shift it into
  // the location's civil clock: east of Greenwich the sun is earlier, and the
  // zone's UTC offset carries the rest (including daylight saving).
  const shift = zoneOffsetForDate(timeZone, year, month, day) - longitude / 15;
  TIME_KEYS.forEach((key) => {
    times[key] += shift;
  });

  // Manual adjustments (minutes).
  const adjustments = options.adjustments ?? {};
  (Object.keys(adjustments) as PrayerKey[]).forEach((key) => {
    const minutes = adjustments[key];
    if (typeof minutes === 'number' && minutes !== 0 && key in times) {
      times[key as TimeKey] += minutes / 60;
    }
  });

  return times;
};

/**
 * Sun altitude used for sunrise/sunset, including the standard
 * 34 arc-minute refraction allowance plus the solar semi-diameter.
 */
const riseSetAngle = (elevationMetres: number): number => {
  const horizonDip = 0.0347 * Math.sqrt(Math.max(elevationMetres, 0));
  return 0.833 + horizonDip;
};

/** Convert a decimal hour of local civil time into an absolute instant. */
export const hoursToDate = (hours: number, date: Date, timeZone: string): Date => {
  const { year, month, day } = calendarPartsInZone(timeZone, date);
  const baseUtc = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  const offset = zoneOffsetForDate(timeZone, year, month, day);
  return new Date(baseUtc + Math.round((hours - offset) * 3600_000));
};

/** Prayer times for `date` at `options.location`, as absolute instants. */
export const getPrayerTimes = (date: Date, options: PrayerTimesOptions): PrayerTimes => {
  const raw = computeRawTimes(date, options);
  const { timeZone } = options.location;
  const result = {} as PrayerTimes;
  TIME_KEYS.forEach((key) => {
    result[key] = hoursToDate(raw[key], date, timeZone);
  });
  // Midnight falls after 00:00 when the night is short; roll it forward so it
  // always reads as "the coming night's midnight".
  if (result.midnight.getTime() < result.sunset.getTime()) {
    result.midnight = new Date(result.midnight.getTime() + 24 * 3600_000);
  }
  return result;
};

/** The five obligatory prayers, in order, with their start times. */
export const PRAYER_TIME_KEYS: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export interface UpcomingPrayer {
  key: TimeKey;
  label: string;
  at: Date;
  /** Milliseconds until it begins (negative once it has started). */
  msUntil: number;
}

export const TIME_LABELS: Record<TimeKey, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  sunset: 'Sunset',
  maghrib: 'Maghrib',
  isha: 'Isha',
  midnight: 'Islamic midnight',
};

/** The next event from `now`, looking into tomorrow when today is exhausted. */
export const getNextPrayer = (
  now: Date,
  options: PrayerTimesOptions,
  keys: TimeKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'],
): UpcomingPrayer => {
  const today = getPrayerTimes(now, options);
  const candidates = keys
    .map((key) => ({ key, at: today[key] }))
    .filter(({ at }) => at.getTime() > now.getTime())
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  if (candidates.length > 0) {
    const { key, at } = candidates[0];
    return { key, label: TIME_LABELS[key], at, msUntil: at.getTime() - now.getTime() };
  }

  const tomorrow = getPrayerTimes(new Date(now.getTime() + 24 * 3600_000), options);
  const key = keys[0];
  return {
    key,
    label: TIME_LABELS[key],
    at: tomorrow[key],
    msUntil: tomorrow[key].getTime() - now.getTime(),
  };
};

/** The prayer period `now` falls inside, or `null` before Fajr. */
export const getCurrentPrayer = (now: Date, options: PrayerTimesOptions): PrayerKey | null => {
  const times = getPrayerTimes(now, options);
  let current: PrayerKey | null = null;
  PRAYER_TIME_KEYS.forEach((key) => {
    if (times[key].getTime() <= now.getTime()) current = key;
  });
  return current;
};

/* ------------------------------------------------------------------ */
/* Formatting                                                           */
/* ------------------------------------------------------------------ */

export const formatTime = (
  date: Date,
  timeFormat: '12h' | '24h' = '12h',
  timeZone?: string,
): string => {
  if (Number.isNaN(date.getTime())) return '--:--';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    })
      .format(date)
      .replace(/\s?(am|pm)/i, (m) => m.toLowerCase());
  } catch {
    return '--:--';
  }
};

/** Human-readable countdown, e.g. `3h 12m` or `47m`. */
export const formatCountdown = (ms: number): string => {
  if (!Number.isFinite(ms)) return '--';
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0 && minutes === 0) {
    return `${Math.max(0, Math.floor(ms / 1000))}s`;
  }
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

/* ------------------------------------------------------------------ */
/* Qibla                                                                */
/* ------------------------------------------------------------------ */

export const KAABA = { latitude: 21.4224779, longitude: 39.8251832 };

/** Great-circle bearing from a location to the Kaaba, in degrees from true north. */
export const getQiblaDirection = (latitude: number, longitude: number): number => {
  const deltaLng = KAABA.longitude - longitude;
  const y = sin(deltaLng);
  const x = cos(latitude) * tan(KAABA.latitude) - sin(latitude) * cos(deltaLng);
  return fixAngle(arctan2(y, x));
};

/** Great-circle distance to the Kaaba, in kilometres. */
export const getDistanceToKaaba = (latitude: number, longitude: number): number => {
  const earthRadiusKm = 6371;
  const dLat = dtr(KAABA.latitude - latitude);
  const dLng = dtr(KAABA.longitude - longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(dtr(latitude)) * Math.cos(dtr(KAABA.latitude)) * Math.sin(dLng / 2) ** 2;
  return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

export const bearingToCompass = (bearing: number): string =>
  COMPASS_POINTS[Math.round(fixAngle(bearing) / 22.5) % 16];
