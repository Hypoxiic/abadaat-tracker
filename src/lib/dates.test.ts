import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addDays,
  describeDateKey,
  differenceInDays,
  formatHijri,
  fromDateKey,
  isValidDateKey,
  lastNDateKeys,
  shiftDateKey,
  toDateKey,
  toHijri,
  todayKey,
} from './dates';

describe('toDateKey', () => {
  it('formats a local date without shifting the day', () => {
    expect(toDateKey(new Date(2025, 0, 5))).toBe('2025-01-05');
    expect(toDateKey(new Date(2025, 11, 31))).toBe('2025-12-31');
  });

  it('uses local time, not UTC (regression)', () => {
    // `toISOString().split('T')[0]` would report the previous day for anyone
    // west of UTC late in the evening. Late-evening local times must not shift.
    const lateEvening = new Date(2025, 5, 10, 23, 30);
    expect(toDateKey(lateEvening)).toBe('2025-06-10');
    const earlyMorning = new Date(2025, 5, 10, 0, 15);
    expect(toDateKey(earlyMorning)).toBe('2025-06-10');
  });

  it('round-trips through fromDateKey', () => {
    const key = '2024-02-29';
    expect(toDateKey(fromDateKey(key))).toBe(key);
  });
});

describe('isValidDateKey', () => {
  it.each(['2025-01-01', '2024-02-29', '2025-12-31'])('accepts %s', (key) => {
    expect(isValidDateKey(key)).toBe(true);
  });

  it.each(['2025-1-1', '2025-13-01', '2025-02-30', 'not-a-date', '', '20250101'])(
    'rejects %s',
    (key) => {
      expect(isValidDateKey(key)).toBe(false);
    },
  );
});

describe('date arithmetic', () => {
  it('shifts date keys across month and year boundaries', () => {
    expect(shiftDateKey('2025-01-31', 1)).toBe('2025-02-01');
    expect(shiftDateKey('2025-03-01', -1)).toBe('2025-02-28');
    expect(shiftDateKey('2024-03-01', -1)).toBe('2024-02-29');
    expect(shiftDateKey('2025-12-31', 1)).toBe('2026-01-01');
  });

  it('survives daylight saving transitions', () => {
    // The UK springs forward on 30 March 2025 and back on 26 October 2025.
    expect(shiftDateKey('2025-03-29', 1)).toBe('2025-03-30');
    expect(shiftDateKey('2025-03-30', 1)).toBe('2025-03-31');
    expect(shiftDateKey('2025-10-25', 1)).toBe('2025-10-26');
    expect(shiftDateKey('2025-10-26', 1)).toBe('2025-10-27');
  });

  it('adds days to a Date', () => {
    expect(toDateKey(addDays(new Date(2025, 0, 30), 3))).toBe('2025-02-02');
  });

  it('measures the difference between two keys', () => {
    expect(differenceInDays('2025-01-10', '2025-01-01')).toBe(9);
    expect(differenceInDays('2025-01-01', '2025-01-10')).toBe(-9);
    expect(differenceInDays('2025-03-31', '2025-03-29')).toBe(2);
  });
});

describe('lastNDateKeys', () => {
  it('returns an inclusive, ascending window', () => {
    expect(lastNDateKeys(3, '2025-06-10')).toEqual(['2025-06-08', '2025-06-09', '2025-06-10']);
  });

  it('returns exactly n entries', () => {
    expect(lastNDateKeys(30, '2025-06-10')).toHaveLength(30);
  });
});

describe('describeDateKey', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 10, 12, 0));
  });
  afterEach(() => vi.useRealTimers());

  it('names relative days', () => {
    expect(todayKey()).toBe('2025-06-10');
    expect(describeDateKey('2025-06-10')).toBe('Today');
    expect(describeDateKey('2025-06-09')).toBe('Yesterday');
    expect(describeDateKey('2025-06-11')).toBe('Tomorrow');
    expect(describeDateKey('2025-06-01')).toContain('Jun');
  });
});

describe('toHijri', () => {
  it('returns a plausible Hijri date', () => {
    const hijri = toHijri(new Date(2025, 5, 10));
    expect(hijri.year).toBeGreaterThan(1440);
    expect(hijri.year).toBeLessThan(1460);
    expect(hijri.month).toBeGreaterThanOrEqual(1);
    expect(hijri.month).toBeLessThanOrEqual(12);
    expect(hijri.day).toBeGreaterThanOrEqual(1);
    expect(hijri.day).toBeLessThanOrEqual(30);
    expect(hijri.monthName.length).toBeGreaterThan(0);
  });

  it('advances by one Hijri day for each Gregorian day', () => {
    const first = toHijri(new Date(2025, 5, 10));
    const second = toHijri(new Date(2025, 5, 11));
    const changed = second.day !== first.day || second.month !== first.month;
    expect(changed).toBe(true);
  });

  it('applies the manual offset', () => {
    const base = toHijri(new Date(2025, 5, 10), 0);
    const shifted = toHijri(new Date(2025, 5, 10), 1);
    expect(shifted.day === base.day + 1 || shifted.month !== base.month).toBe(true);
  });

  it('formats a readable string', () => {
    const hijri = toHijri(new Date(2025, 5, 10));
    expect(formatHijri(hijri)).toMatch(/^\d{1,2} .+ \d{4} AH$/);
  });
});
