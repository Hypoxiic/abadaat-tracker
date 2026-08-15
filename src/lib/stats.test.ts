import { describe, expect, it } from 'vitest';
import {
  buildHeatmap,
  buildSeries,
  computeActivityStreak,
  computeBestPrayerStreak,
  computePrayerStreak,
  countCompletedPrayers,
  missedPrayerBreakdown,
  prayerConsistency,
  summariseDay,
  totalDhikr,
  totalDuas,
  totalQuranPages,
  totalsForRange,
} from './stats';
import { createDefaultState, createEmptyDay } from './store';
import { PRAYER_KEYS, type AppState, type PrayerStatus } from './types';

const withDays = (
  days: Record<string, Partial<ReturnType<typeof createEmptyDay>>>,
): AppState => {
  const state = createDefaultState();
  Object.entries(days).forEach(([date, partial]) => {
    state.days[date] = { ...createEmptyDay(date), ...partial, date };
  });
  return state;
};

const allPrayers = (status: PrayerStatus) =>
  Object.fromEntries(PRAYER_KEYS.map((key) => [key, status])) as Record<
    (typeof PRAYER_KEYS)[number],
    PrayerStatus
  >;

describe('day totals', () => {
  it('counts every completed status, including qadha', () => {
    const day = createEmptyDay('2025-06-10');
    day.prayers = { fajr: 'jamaah', dhuhr: 'ontime', asr: 'late', maghrib: 'qadha', isha: 'none' };
    expect(countCompletedPrayers(day)).toBe(4);
  });

  it('sums Qur\'an pages and rounds to one decimal', () => {
    const day = createEmptyDay('2025-06-10');
    day.quran = [
      { id: '1', surah: 1, startAyah: 1, endAyah: 7, pages: 1.25, minutes: 5, notes: '', createdAt: '' },
      { id: '2', surah: 2, startAyah: 1, endAyah: 5, pages: 2.1, minutes: 8, notes: '', createdAt: '' },
    ];
    expect(totalQuranPages(day)).toBe(3.4);
  });

  it('sums dhikr and du\'a counts', () => {
    const day = createEmptyDay('2025-06-10');
    day.dhikr = { salawat: 100, tahlil: 33 };
    day.duas = [
      { duaId: 'a', count: 2 },
      { duaId: 'b', count: 1 },
    ];
    expect(totalDhikr(day)).toBe(133);
    expect(totalDuas(day)).toBe(3);
  });
});

describe('computePrayerStreak', () => {
  it('counts consecutive complete days ending today', () => {
    const state = withDays({
      '2025-06-08': { prayers: allPrayers('ontime') },
      '2025-06-09': { prayers: allPrayers('ontime') },
      '2025-06-10': { prayers: allPrayers('ontime') },
    });
    expect(computePrayerStreak(state, '2025-06-10')).toBe(3);
  });

  it('does not break the streak while today is still in progress (regression)', () => {
    // The old implementation reset the stored streak to 0 whenever the previous
    // day was incomplete, and incremented it again on every page mount.
    const state = withDays({
      '2025-06-08': { prayers: allPrayers('ontime') },
      '2025-06-09': { prayers: allPrayers('ontime') },
      '2025-06-10': { prayers: { ...allPrayers('none'), fajr: 'ontime' } },
    });
    expect(computePrayerStreak(state, '2025-06-10')).toBe(2);
  });

  it('is stable when called repeatedly (regression)', () => {
    const state = withDays({ '2025-06-10': { prayers: allPrayers('ontime') } });
    const first = computePrayerStreak(state, '2025-06-10');
    const second = computePrayerStreak(state, '2025-06-10');
    const third = computePrayerStreak(state, '2025-06-10');
    expect([first, second, third]).toEqual([1, 1, 1]);
  });

  it('breaks on a missed day', () => {
    const state = withDays({
      '2025-06-07': { prayers: allPrayers('ontime') },
      '2025-06-08': { prayers: { ...allPrayers('ontime'), isha: 'none' } },
      '2025-06-09': { prayers: allPrayers('ontime') },
      '2025-06-10': { prayers: allPrayers('ontime') },
    });
    expect(computePrayerStreak(state, '2025-06-10')).toBe(2);
  });

  it('returns zero with no data', () => {
    expect(computePrayerStreak(createDefaultState(), '2025-06-10')).toBe(0);
  });
});

describe('computeActivityStreak', () => {
  it('counts any recorded worship', () => {
    const state = withDays({
      '2025-06-09': { dhikr: { salawat: 10 } },
      '2025-06-10': { duas: [{ duaId: 'dua-kumayl', count: 1 }] },
    });
    expect(computeActivityStreak(state, '2025-06-10')).toBe(2);
  });
});

describe('computeBestPrayerStreak', () => {
  it('finds the longest run anywhere in the record', () => {
    const state = withDays({
      '2025-01-01': { prayers: allPrayers('ontime') },
      '2025-01-02': { prayers: allPrayers('ontime') },
      '2025-01-03': { prayers: allPrayers('ontime') },
      '2025-01-04': { prayers: allPrayers('ontime') },
      '2025-03-01': { prayers: allPrayers('ontime') },
      '2025-03-02': { prayers: allPrayers('ontime') },
    });
    expect(computeBestPrayerStreak(state)).toBe(4);
  });

  it('returns zero when nothing is complete', () => {
    const state = withDays({ '2025-01-01': { prayers: { ...allPrayers('none'), fajr: 'ontime' } } });
    expect(computeBestPrayerStreak(state)).toBe(0);
  });
});

describe('buildSeries', () => {
  it('returns one value per day, oldest first', () => {
    const state = withDays({
      '2025-06-09': { prayers: { ...allPrayers('none'), fajr: 'ontime', dhuhr: 'ontime' } },
      '2025-06-10': { prayers: allPrayers('ontime') },
    });
    const series = buildSeries(state, 'prayers', 3, '2025-06-10');
    expect(series.dates).toEqual(['2025-06-08', '2025-06-09', '2025-06-10']);
    expect(series.values).toEqual([0, 2, 5]);
  });

  it('is deterministic (regression against randomly generated charts)', () => {
    const state = withDays({ '2025-06-10': { dhikr: { salawat: 42 } } });
    const a = buildSeries(state, 'dhikr', 7, '2025-06-10');
    const b = buildSeries(state, 'dhikr', 7, '2025-06-10');
    expect(a.values).toEqual(b.values);
    expect(a.values.at(-1)).toBe(42);
  });

  it('reports zero for days with no record', () => {
    const series = buildSeries(createDefaultState(), 'quran', 5, '2025-06-10');
    expect(series.values).toEqual([0, 0, 0, 0, 0]);
  });
});

describe('totalsForRange', () => {
  it('aggregates a window', () => {
    const state = withDays({
      '2025-06-09': { prayers: allPrayers('ontime'), dhikr: { salawat: 50 } },
      '2025-06-10': {
        prayers: { ...allPrayers('none'), fajr: 'ontime' },
        quran: [
          { id: '1', surah: 1, startAyah: 1, endAyah: 7, pages: 2, minutes: 15, notes: '', createdAt: '' },
        ],
      },
    });
    const totals = totalsForRange(state, 7, '2025-06-10');
    expect(totals.prayersCompleted).toBe(6);
    expect(totals.prayersPossible).toBe(35);
    expect(totals.quranPages).toBe(2);
    expect(totals.quranMinutes).toBe(15);
    expect(totals.dhikrCount).toBe(50);
    expect(totals.activeDays).toBe(2);
    expect(totals.completeDays).toBe(1);
  });
});

describe('prayerConsistency', () => {
  it('reports a percentage of prayers kept', () => {
    const state = withDays({
      '2025-06-09': { prayers: allPrayers('ontime') },
      '2025-06-10': { prayers: allPrayers('ontime') },
    });
    expect(prayerConsistency(state, 2, '2025-06-10')).toBe(100);
    expect(prayerConsistency(state, 4, '2025-06-10')).toBe(50);
  });

  it('returns zero rather than NaN with no data', () => {
    expect(prayerConsistency(createDefaultState(), 30, '2025-06-10')).toBe(0);
  });
});

describe('missedPrayerBreakdown', () => {
  it('sorts the most-missed prayer first', () => {
    const state = withDays({
      '2025-06-09': { prayers: { ...allPrayers('ontime'), isha: 'none' } },
      '2025-06-10': { prayers: { ...allPrayers('ontime'), isha: 'none' } },
    });
    const breakdown = missedPrayerBreakdown(state, 2, '2025-06-10');
    expect(breakdown[0].prayer).toBe('isha');
    expect(breakdown[0].missed).toBe(2);
    expect(breakdown[0].total).toBe(2);
  });
});

describe('buildHeatmap', () => {
  it('assigns intensity levels from 0 to 4', () => {
    const state = withDays({
      '2025-06-10': {
        prayers: allPrayers('ontime'),
        dhikr: { salawat: 10 },
        duas: [{ duaId: 'a', count: 1 }],
        quran: [
          { id: '1', surah: 1, startAyah: 1, endAyah: 7, pages: 1, minutes: 0, notes: '', createdAt: '' },
        ],
      },
    });
    const cells = buildHeatmap(state, 3, '2025-06-10');
    expect(cells).toHaveLength(3);
    expect(cells[0].level).toBe(0);
    expect(cells.at(-1)?.level).toBe(4);
  });
});

describe('summariseDay', () => {
  it('marks a day complete only when all five prayers are recorded', () => {
    const state = withDays({
      '2025-06-10': { prayers: { ...allPrayers('ontime'), isha: 'none' } },
      '2025-06-09': { prayers: allPrayers('qadha') },
    });
    expect(summariseDay(state, '2025-06-10').complete).toBe(false);
    expect(summariseDay(state, '2025-06-09').complete).toBe(true);
  });

  it('returns a zeroed summary for an unknown day', () => {
    const summary = summariseDay(createDefaultState(), '2020-01-01');
    expect(summary.prayersCompleted).toBe(0);
    expect(summary.quranPages).toBe(0);
    expect(summary.complete).toBe(false);
  });
});
