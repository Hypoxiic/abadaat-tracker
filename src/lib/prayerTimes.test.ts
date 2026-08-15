import { describe, expect, it } from 'vitest';
import {
  CALCULATION_METHODS,
  bearingToCompass,
  computeRawTimes,
  formatCountdown,
  formatTime,
  getCurrentPrayer,
  getDistanceToKaaba,
  getNextPrayer,
  getPrayerTimes,
  getQiblaDirection,
  julianDate,
  sunPosition,
  timeZoneOffsetHours,
  type PrayerTimesOptions,
} from './prayerTimes';

const MILTON_KEYNES = {
  latitude: 52.0406,
  longitude: -0.7594,
  timeZone: 'Europe/London',
};

const MAKKAH = { latitude: 21.4225, longitude: 39.8262, timeZone: 'Asia/Riyadh' };

const baseOptions = (
  overrides: Partial<PrayerTimesOptions> = {},
): PrayerTimesOptions => ({
  location: MILTON_KEYNES,
  method: 'jafari',
  asrMadhab: 'standard',
  highLatitudeRule: 'middleOfNight',
  ...overrides,
});

/** Local wall-clock time in a zone, as `HH:MM`. */
const at = (date: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

const minutesOf = (value: string): number => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

/** Assert a formatted HH:MM time is within a tolerance in minutes of an expected one. */
const expectWithin = (actual: string, expected: string, tolerance: number): void => {
  const delta = Math.abs(minutesOf(actual) - minutesOf(expected));
  expect(delta, `expected ${actual} to be within ${tolerance} min of ${expected}`).toBeLessThanOrEqual(
    tolerance,
  );
};

describe('julianDate', () => {
  it('matches known Julian day numbers', () => {
    // J2000.0 epoch: 2000-01-01 12:00 UT is JD 2451545.0, so 00:00 is .5 lower.
    expect(julianDate(2000, 1, 1)).toBe(2451544.5);
    expect(julianDate(1987, 1, 27)).toBe(2446822.5);
    expect(julianDate(2025, 3, 1)).toBe(2460735.5);
  });

  it('handles January and February as months 13 and 14 of the previous year', () => {
    expect(julianDate(2024, 2, 29) - julianDate(2024, 2, 28)).toBe(1);
    expect(julianDate(2024, 3, 1) - julianDate(2024, 2, 29)).toBe(1);
  });
});

describe('sunPosition', () => {
  it('puts the sun near the equator at the equinoxes', () => {
    const march = sunPosition(julianDate(2025, 3, 20) + 0.5);
    expect(Math.abs(march.declination)).toBeLessThan(1);

    const september = sunPosition(julianDate(2025, 9, 22) + 0.5);
    expect(Math.abs(september.declination)).toBeLessThan(1.5);
  });

  it('reaches the tropics at the solstices', () => {
    const june = sunPosition(julianDate(2025, 6, 21) + 0.5);
    expect(june.declination).toBeGreaterThan(23);
    expect(june.declination).toBeLessThan(23.5);

    const december = sunPosition(julianDate(2025, 12, 21) + 0.5);
    expect(december.declination).toBeLessThan(-23);
    expect(december.declination).toBeGreaterThan(-23.5);
  });

  it('keeps the equation of time within its known bounds', () => {
    for (let day = 1; day <= 365; day += 7) {
      const jd = julianDate(2025, 1, 1) + day;
      const { equation } = sunPosition(jd);
      // The equation of time never exceeds roughly ±16.5 minutes.
      expect(Math.abs(equation)).toBeLessThan(16.5 / 60);
    }
  });
});

describe('computeRawTimes', () => {
  it('produces prayer times in chronological order', () => {
    const times = computeRawTimes(new Date(2025, 5, 15), baseOptions());
    expect(times.fajr).toBeLessThan(times.sunrise);
    expect(times.sunrise).toBeLessThan(times.dhuhr);
    expect(times.dhuhr).toBeLessThan(times.asr);
    expect(times.asr).toBeLessThan(times.sunset);
    expect(times.sunset).toBeLessThanOrEqual(times.maghrib);
    expect(times.maghrib).toBeLessThanOrEqual(times.isha);
  });

  it('places Hanafi Asr later than the standard Asr', () => {
    const date = new Date(2025, 3, 10);
    const standard = computeRawTimes(date, baseOptions({ asrMadhab: 'standard' }));
    const hanafi = computeRawTimes(date, baseOptions({ asrMadhab: 'hanafi' }));
    expect(hanafi.asr).toBeGreaterThan(standard.asr);
  });

  it('applies manual adjustments in minutes', () => {
    const date = new Date(2025, 3, 10);
    const plain = computeRawTimes(date, baseOptions());
    const nudged = computeRawTimes(
      date,
      baseOptions({ adjustments: { fajr: 5, isha: -10 } }),
    );
    expect(nudged.fajr - plain.fajr).toBeCloseTo(5 / 60, 6);
    expect(nudged.isha - plain.isha).toBeCloseTo(-10 / 60, 6);
  });

  it("uses the Ja'fari maghrib angle rather than plain sunset", () => {
    const date = new Date(2025, 3, 10);
    const jafari = computeRawTimes(date, baseOptions({ method: 'jafari' }));
    const mwl = computeRawTimes(date, baseOptions({ method: 'mwl' }));
    expect(jafari.maghrib).toBeGreaterThan(jafari.sunset);
    expect(mwl.maghrib).toBeCloseTo(mwl.sunset, 6);
  });

  it('keeps Fajr and Isha inside the night at high latitude in midsummer', () => {
    const reykjavik = { latitude: 64.1466, longitude: -21.9426, timeZone: 'Atlantic/Reykjavik' };
    const times = computeRawTimes(
      new Date(2025, 5, 21),
      baseOptions({ location: reykjavik, highLatitudeRule: 'middleOfNight' }),
    );
    expect(Number.isFinite(times.fajr)).toBe(true);
    expect(Number.isFinite(times.isha)).toBe(true);
    expect(times.fajr).toBeLessThan(times.sunrise);
    expect(times.isha).toBeGreaterThan(times.sunset);
  });

  it("computes Ja'fari midnight between sunset and Fajr", () => {
    const times = computeRawTimes(new Date(2025, 2, 15), baseOptions({ midnightMode: 'jafari' }));
    // Midnight is expressed on the same 0-24 scale, so it may wrap past 24.
    const midnight = times.midnight % 24;
    const nightLength = (24 + times.fajr - times.sunset) % 24;
    const fromSunset = (24 + midnight - times.sunset) % 24;
    expect(fromSunset).toBeCloseTo(nightLength / 2, 4);
  });

  it('differs between the standard and Jafari midnight conventions', () => {
    const date = new Date(2025, 2, 15);
    const jafari = computeRawTimes(date, baseOptions({ midnightMode: 'jafari' }));
    const standard = computeRawTimes(date, baseOptions({ midnightMode: 'standard' }));
    expect(jafari.midnight).not.toBeCloseTo(standard.midnight, 3);
  });
});

describe('getPrayerTimes', () => {
  it('returns times on the requested calendar day in the location timezone', () => {
    const times = getPrayerTimes(new Date(2025, 2, 15, 9, 0), baseOptions());
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    expect(formatter.format(times.dhuhr)).toBe('2025-03-15');
    expect(formatter.format(times.fajr)).toBe('2025-03-15');
  });

  it('matches published sun data for Milton Keynes (GMT)', () => {
    // Published values for Milton Keynes, 1 March 2025 (Europe/London, GMT):
    // sunrise 06:48, sunset 17:42, solar noon 12:15.
    const times = getPrayerTimes(new Date(2025, 2, 1, 12, 0), baseOptions());
    expectWithin(at(times.sunrise, 'Europe/London'), '06:48', 2);
    expectWithin(at(times.sunset, 'Europe/London'), '17:42', 2);
    expectWithin(at(times.dhuhr, 'Europe/London'), '12:15', 2);
  });

  it('matches published sun data at midsummer under British Summer Time', () => {
    // 21 June 2025 is BST (UTC+1): sunrise 04:42, sunset 21:26, noon ~13:04.
    // A missing timezone or longitude correction shows up immediately here.
    const times = getPrayerTimes(new Date(2025, 5, 21, 12, 0), baseOptions());
    expectWithin(at(times.sunrise, 'Europe/London'), '04:42', 2);
    expectWithin(at(times.sunset, 'Europe/London'), '21:26', 2);
    expectWithin(at(times.dhuhr, 'Europe/London'), '13:04', 2);
  });

  it('matches published sun data at midwinter', () => {
    // 21 December 2025: sunrise 08:08, sunset 15:53.
    const times = getPrayerTimes(new Date(2025, 11, 21, 12, 0), baseOptions());
    expectWithin(at(times.sunrise, 'Europe/London'), '08:08', 2);
    expectWithin(at(times.sunset, 'Europe/London'), '15:53', 2);
  });

  it('is location sensitive', () => {
    const date = new Date(2025, 5, 15, 12, 0);
    const mk = getPrayerTimes(date, baseOptions());
    const makkah = getPrayerTimes(date, baseOptions({ location: MAKKAH }));
    expect(mk.dhuhr.getTime()).not.toBe(makkah.dhuhr.getTime());
    // Northern Europe has a far longer midsummer day than Makkah.
    const mkDay = mk.sunset.getTime() - mk.sunrise.getTime();
    const makkahDay = makkah.sunset.getTime() - makkah.sunrise.getTime();
    expect(mkDay).toBeGreaterThan(makkahDay);
  });

  it('always places midnight after sunset', () => {
    for (const month of [0, 3, 6, 9]) {
      const times = getPrayerTimes(new Date(2025, month, 12, 12, 0), baseOptions());
      expect(times.midnight.getTime()).toBeGreaterThan(times.sunset.getTime());
    }
  });

  it('does not return identical times for every city (regression)', () => {
    // The previous implementation returned hard-coded times per city, so two
    // different days in the same city were always the same.
    const winter = getPrayerTimes(new Date(2025, 0, 15, 12, 0), baseOptions());
    const summer = getPrayerTimes(new Date(2025, 6, 15, 12, 0), baseOptions());
    expect(at(winter.fajr, 'Europe/London')).not.toBe(at(summer.fajr, 'Europe/London'));
  });

  it('is deterministic (regression against the random-time implementation)', () => {
    const date = new Date(2025, 4, 20, 12, 0);
    const first = getPrayerTimes(date, baseOptions());
    const second = getPrayerTimes(date, baseOptions());
    expect(first.fajr.getTime()).toBe(second.fajr.getTime());
    expect(first.isha.getTime()).toBe(second.isha.getTime());
  });
});

describe('getNextPrayer', () => {
  it('finds the next prayer later the same day', () => {
    const options = baseOptions();
    const times = getPrayerTimes(new Date(2025, 2, 15, 12, 0), options);
    const justBeforeAsr = new Date(times.asr.getTime() - 60_000);
    const next = getNextPrayer(justBeforeAsr, options);
    expect(next.key).toBe('asr');
    expect(next.msUntil).toBeGreaterThan(0);
    expect(next.msUntil).toBeLessThanOrEqual(60_000);
  });

  it("rolls over to tomorrow's Fajr after Isha", () => {
    const options = baseOptions();
    const times = getPrayerTimes(new Date(2025, 2, 15, 12, 0), options);
    const afterIsha = new Date(times.isha.getTime() + 30 * 60_000);
    const next = getNextPrayer(afterIsha, options);
    expect(next.key).toBe('fajr');
    expect(next.at.getTime()).toBeGreaterThan(afterIsha.getTime());
  });
});

describe('getCurrentPrayer', () => {
  it('returns null before Fajr and the right prayer afterwards', () => {
    const options = baseOptions();
    const times = getPrayerTimes(new Date(2025, 2, 15, 12, 0), options);
    expect(getCurrentPrayer(new Date(times.fajr.getTime() - 60_000), options)).toBeNull();
    expect(getCurrentPrayer(new Date(times.fajr.getTime() + 60_000), options)).toBe('fajr');
    expect(getCurrentPrayer(new Date(times.asr.getTime() + 60_000), options)).toBe('asr');
    expect(getCurrentPrayer(new Date(times.isha.getTime() + 60_000), options)).toBe('isha');
  });
});

describe('timeZoneOffsetHours', () => {
  it('tracks daylight saving transitions', () => {
    expect(timeZoneOffsetHours('Europe/London', new Date(Date.UTC(2025, 0, 15, 12)))).toBe(0);
    expect(timeZoneOffsetHours('Europe/London', new Date(Date.UTC(2025, 6, 15, 12)))).toBe(1);
    expect(timeZoneOffsetHours('Asia/Kolkata', new Date(Date.UTC(2025, 0, 15, 12)))).toBe(5.5);
    expect(timeZoneOffsetHours('America/New_York', new Date(Date.UTC(2025, 0, 15, 12)))).toBe(-5);
  });

  it('falls back gracefully for an unknown zone', () => {
    expect(Number.isFinite(timeZoneOffsetHours('Not/AZone', new Date()))).toBe(true);
  });
});

describe('formatting', () => {
  it('formats times in both 12 and 24 hour styles', () => {
    const date = new Date(Date.UTC(2025, 2, 15, 17, 5));
    expect(formatTime(date, '24h', 'UTC')).toBe('17:05');
    expect(formatTime(date, '12h', 'UTC').toLowerCase()).toContain('5:05');
    expect(formatTime(date, '12h', 'UTC').toLowerCase()).toContain('pm');
  });

  it('returns a placeholder for an invalid date', () => {
    expect(formatTime(new Date(NaN), '24h', 'UTC')).toBe('--:--');
  });

  it('formats countdowns', () => {
    expect(formatCountdown(90 * 60_000)).toBe('1h 30m');
    expect(formatCountdown(45 * 60_000)).toBe('45m');
    expect(formatCountdown(30_000)).toBe('30s');
    expect(formatCountdown(-5000)).toBe('0s');
  });
});

describe('qibla', () => {
  it('points roughly south-east from the United Kingdom', () => {
    const bearing = getQiblaDirection(MILTON_KEYNES.latitude, MILTON_KEYNES.longitude);
    expect(bearing).toBeGreaterThan(110);
    expect(bearing).toBeLessThan(130);
    expect(bearingToCompass(bearing)).toMatch(/SE|ESE/);
  });

  it('points roughly north-west from Jakarta', () => {
    const bearing = getQiblaDirection(-6.2088, 106.8456);
    expect(bearing).toBeGreaterThan(285);
    expect(bearing).toBeLessThan(300);
  });

  it('reports distance to the Kaaba', () => {
    expect(getDistanceToKaaba(21.4225, 39.8262)).toBe(0);
    const fromLondon = getDistanceToKaaba(51.5074, -0.1278);
    expect(fromLondon).toBeGreaterThan(4500);
    expect(fromLondon).toBeLessThan(5200);
  });
});

describe('calculation methods', () => {
  it('exposes a complete parameter set for every method', () => {
    Object.entries(CALCULATION_METHODS).forEach(([key, method]) => {
      expect(method.key).toBe(key);
      expect(method.name.length).toBeGreaterThan(0);
      expect(method.fajrAngle).toBeGreaterThan(10);
      expect(method.fajrAngle).toBeLessThan(21);
      expect(['angle', 'minutes']).toContain(method.isha.type);
    });
  });

  it('gives an earlier Fajr for a larger twilight angle', () => {
    const date = new Date(2025, 3, 10);
    const egypt = computeRawTimes(date, baseOptions({ method: 'egypt' })); // 19.5 degrees
    const isna = computeRawTimes(date, baseOptions({ method: 'isna' })); // 15 degrees
    expect(egypt.fajr).toBeLessThan(isna.fajr);
  });
});
