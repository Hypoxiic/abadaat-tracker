/**
 * Derived statistics.
 *
 * Everything here is a pure function of stored day records. The old code kept
 * separate `*_stats` blobs in localStorage that were mutated on render and
 * drifted from reality (the Qur'an totals grew every time the page mounted);
 * nothing is cached now, so the numbers cannot disagree with the data.
 */

import { lastNDateKeys, shiftDateKey, todayKey } from './dates';
import { COMPLETED_STATUSES, PRAYER_KEYS } from './types';
import type { AppState, DayRecord, PrayerKey, PrayerStatus } from './types';
import { createEmptyDay } from './store';

export const isCompleted = (status: PrayerStatus): boolean =>
  COMPLETED_STATUSES.includes(status);

export const getDay = (state: AppState, dateKey: string): DayRecord =>
  state.days[dateKey] ?? createEmptyDay(dateKey);

export const countCompletedPrayers = (day: DayRecord): number =>
  PRAYER_KEYS.filter((key) => isCompleted(day.prayers[key])).length;

export const countPrayersBy = (day: DayRecord, status: PrayerStatus): number =>
  PRAYER_KEYS.filter((key) => day.prayers[key] === status).length;

export const totalQuranPages = (day: DayRecord): number =>
  Math.round(day.quran.reduce((sum, entry) => sum + entry.pages, 0) * 10) / 10;

export const totalQuranMinutes = (day: DayRecord): number =>
  day.quran.reduce((sum, entry) => sum + entry.minutes, 0);

export const totalDhikr = (day: DayRecord): number =>
  Object.values(day.dhikr).reduce((sum, count) => sum + count, 0);

export const totalDuas = (day: DayRecord): number =>
  day.duas.reduce((sum, entry) => sum + entry.count, 0);

export const hasAnyActivity = (day: DayRecord): boolean =>
  countCompletedPrayers(day) > 0 ||
  day.quran.length > 0 ||
  totalDhikr(day) > 0 ||
  totalDuas(day) > 0;

export interface DaySummary {
  date: string;
  prayersCompleted: number;
  quranPages: number;
  quranMinutes: number;
  dhikrCount: number;
  duaCount: number;
  complete: boolean;
}

export const summariseDay = (state: AppState, dateKey: string): DaySummary => {
  const day = getDay(state, dateKey);
  const prayersCompleted = countCompletedPrayers(day);
  return {
    date: dateKey,
    prayersCompleted,
    quranPages: totalQuranPages(day),
    quranMinutes: totalQuranMinutes(day),
    dhikrCount: totalDhikr(day),
    duaCount: totalDuas(day),
    complete: prayersCompleted === PRAYER_KEYS.length,
  };
};

/* ------------------------------------------------------------------ */
/* Streaks                                                              */
/* ------------------------------------------------------------------ */

/**
 * Consecutive days on which every obligatory prayer was recorded.
 *
 * Today is only counted once it is complete: a day still in progress must not
 * break the streak, which is what the old implementation did (it also
 * incremented the stored streak on every page mount).
 */
export const computePrayerStreak = (state: AppState, today: string = todayKey()): number => {
  let cursor = today;
  const todayComplete = countCompletedPrayers(getDay(state, today)) === PRAYER_KEYS.length;
  if (!todayComplete) cursor = shiftDateKey(today, -1);

  let streak = 0;
  // Bounded so a corrupt clock can never spin here.
  for (let i = 0; i < 3650; i += 1) {
    if (countCompletedPrayers(getDay(state, cursor)) !== PRAYER_KEYS.length) break;
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
};

/** Consecutive days with any recorded worship at all. */
export const computeActivityStreak = (state: AppState, today: string = todayKey()): number => {
  let cursor = today;
  if (!hasAnyActivity(getDay(state, today))) cursor = shiftDateKey(today, -1);

  let streak = 0;
  for (let i = 0; i < 3650; i += 1) {
    if (!hasAnyActivity(getDay(state, cursor))) break;
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
};

/** Longest run of fully-complete prayer days anywhere in the record. */
export const computeBestPrayerStreak = (state: AppState): number => {
  const completeDays = Object.keys(state.days)
    .filter((key) => countCompletedPrayers(state.days[key]) === PRAYER_KEYS.length)
    .sort();

  let best = 0;
  let run = 0;
  let previous: string | null = null;
  completeDays.forEach((key) => {
    run = previous !== null && shiftDateKey(previous, 1) === key ? run + 1 : 1;
    previous = key;
    if (run > best) best = run;
  });
  return best;
};

/* ------------------------------------------------------------------ */
/* Series                                                               */
/* ------------------------------------------------------------------ */

export type MetricKey = 'prayers' | 'quran' | 'dhikr' | 'dua';

export const METRIC_LABELS: Record<MetricKey, string> = {
  prayers: 'Prayers completed',
  quran: "Qur'an pages",
  dhikr: 'Dhikr count',
  dua: "Du'a recitations",
};

export const metricValue = (summary: DaySummary, metric: MetricKey): number => {
  switch (metric) {
    case 'prayers':
      return summary.prayersCompleted;
    case 'quran':
      return summary.quranPages;
    case 'dhikr':
      return summary.dhikrCount;
    case 'dua':
      return summary.duaCount;
    default:
      return 0;
  }
};

export interface Series {
  dates: string[];
  values: number[];
}

/** Real historical series for a metric — no more randomly generated charts. */
export const buildSeries = (
  state: AppState,
  metric: MetricKey,
  days = 7,
  endKey: string = todayKey(),
): Series => {
  const dates = lastNDateKeys(days, endKey);
  return {
    dates,
    values: dates.map((date) => metricValue(summariseDay(state, date), metric)),
  };
};

export interface RangeTotals {
  prayersCompleted: number;
  prayersPossible: number;
  quranPages: number;
  quranMinutes: number;
  dhikrCount: number;
  duaCount: number;
  activeDays: number;
  completeDays: number;
}

export const totalsForRange = (
  state: AppState,
  days = 7,
  endKey: string = todayKey(),
): RangeTotals => {
  const summaries = lastNDateKeys(days, endKey).map((date) => summariseDay(state, date));
  return summaries.reduce<RangeTotals>(
    (totals, summary) => ({
      prayersCompleted: totals.prayersCompleted + summary.prayersCompleted,
      prayersPossible: totals.prayersPossible + PRAYER_KEYS.length,
      quranPages: Math.round((totals.quranPages + summary.quranPages) * 10) / 10,
      quranMinutes: totals.quranMinutes + summary.quranMinutes,
      dhikrCount: totals.dhikrCount + summary.dhikrCount,
      duaCount: totals.duaCount + summary.duaCount,
      activeDays:
        totals.activeDays +
        (summary.prayersCompleted > 0 ||
        summary.quranPages > 0 ||
        summary.dhikrCount > 0 ||
        summary.duaCount > 0
          ? 1
          : 0),
      completeDays: totals.completeDays + (summary.complete ? 1 : 0),
    }),
    {
      prayersCompleted: 0,
      prayersPossible: 0,
      quranPages: 0,
      quranMinutes: 0,
      dhikrCount: 0,
      duaCount: 0,
      activeDays: 0,
      completeDays: 0,
    },
  );
};

/** Prayer consistency over a window, as a 0-100 percentage. */
export const prayerConsistency = (
  state: AppState,
  days = 30,
  endKey: string = todayKey(),
): number => {
  const totals = totalsForRange(state, days, endKey);
  if (totals.prayersPossible === 0) return 0;
  return Math.round((totals.prayersCompleted / totals.prayersPossible) * 100);
};

/** How often each prayer is missed, most-missed first. */
export const missedPrayerBreakdown = (
  state: AppState,
  days = 30,
  endKey: string = todayKey(),
): Array<{ prayer: PrayerKey; missed: number; total: number }> => {
  const dates = lastNDateKeys(days, endKey);
  return PRAYER_KEYS.map((prayer) => ({
    prayer,
    missed: dates.filter((date) => !isCompleted(getDay(state, date).prayers[prayer])).length,
    total: dates.length,
  })).sort((a, b) => b.missed - a.missed);
};

/** Contribution-style heatmap data: 0-4 intensity per day. */
export interface HeatmapCell {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  summary: DaySummary;
}

export const buildHeatmap = (
  state: AppState,
  days = 91,
  endKey: string = todayKey(),
): HeatmapCell[] =>
  lastNDateKeys(days, endKey).map((date) => {
    const summary = summariseDay(state, date);
    let score = summary.prayersCompleted;
    if (summary.quranPages > 0) score += 1;
    if (summary.dhikrCount > 0) score += 1;
    if (summary.duaCount > 0) score += 1;

    let level: HeatmapCell['level'] = 0;
    if (score >= 7) level = 4;
    else if (score >= 5) level = 3;
    else if (score >= 3) level = 2;
    else if (score >= 1) level = 1;

    return { date, level, summary };
  });
