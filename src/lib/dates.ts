/**
 * Date helpers.
 *
 * The app keys every record by local calendar date (`yyyy-MM-dd`). Using
 * `toISOString()` for that would silently shift the day for anyone west of
 * UTC, so all conversion goes through `toDateKey` instead.
 */

export const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const pad = (n: number) => String(n).padStart(2, '0');

/** `yyyy-MM-dd` for a date, evaluated in the local timezone. */
export const toDateKey = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Parse a `yyyy-MM-dd` key into a local-midnight `Date`. */
export const fromDateKey = (key: string): Date => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

export const isValidDateKey = (key: string): boolean => {
  if (!DATE_KEY_PATTERN.test(key)) return false;
  const date = fromDateKey(key);
  return !Number.isNaN(date.getTime()) && toDateKey(date) === key;
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const shiftDateKey = (key: string, days: number): string =>
  toDateKey(addDays(fromDateKey(key), days));

export const todayKey = (): string => toDateKey(new Date());

export const isToday = (key: string): boolean => key === todayKey();

export const isFuture = (key: string): boolean => key > todayKey();

/** Inclusive list of date keys ending at `endKey`, oldest first. */
export const lastNDateKeys = (n: number, endKey: string = todayKey()): string[] => {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i -= 1) keys.push(shiftDateKey(endKey, -i));
  return keys;
};

export const differenceInDays = (aKey: string, bKey: string): number =>
  Math.round((fromDateKey(aKey).getTime() - fromDateKey(bKey).getTime()) / 86_400_000);

const LONG_DATE = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const MEDIUM_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const SHORT_DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

const WEEKDAY_SHORT = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });

export const formatLongDate = (date: Date): string => LONG_DATE.format(date);
export const formatMediumDate = (date: Date): string => MEDIUM_DATE.format(date);
export const formatShortDate = (date: Date): string => SHORT_DATE.format(date);
export const formatWeekday = (date: Date): string => WEEKDAY_SHORT.format(date);

/** "Today" / "Yesterday" / a formatted date. */
export const describeDateKey = (key: string): string => {
  const today = todayKey();
  if (key === today) return 'Today';
  if (key === shiftDateKey(today, -1)) return 'Yesterday';
  if (key === shiftDateKey(today, 1)) return 'Tomorrow';
  return formatMediumDate(fromDateKey(key));
};

/* ------------------------------------------------------------------ */
/* Hijri calendar                                                       */
/* ------------------------------------------------------------------ */

export const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qa'dah",
  'Dhu al-Hijjah',
];

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

/**
 * Arithmetic (tabular) Hijri conversion — used as a fallback when the runtime
 * has no Islamic calendar data.
 */
const tabularHijri = (date: Date): HijriDate => {
  const jd =
    Math.floor(
      (1461 * (date.getFullYear() + 4800 + Math.floor((date.getMonth() - 2) / 12))) / 4,
    ) +
    Math.floor((367 * (date.getMonth() - 1 - 12 * Math.floor((date.getMonth() - 2) / 12))) / 12) -
    Math.floor(
      (3 * Math.floor((date.getFullYear() + 4900 + Math.floor((date.getMonth() - 2) / 12)) / 100)) /
        4,
    ) +
    date.getDate() -
    32075;

  const l0 = jd - 1948440 + 10632;
  const n = Math.floor((l0 - 1) / 10631);
  const l1 = l0 - 10631 * n + 354;
  const j =
    Math.floor((10985 - l1) / 5316) * Math.floor((50 * l1) / 17719) +
    Math.floor(l1 / 5670) * Math.floor((43 * l1) / 15238);
  const l2 =
    l1 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l2) / 709);
  const day = l2 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { day, month, year, monthName: HIJRI_MONTHS[(month - 1) % 12] ?? '' };
};

let islamicFormatter: Intl.DateTimeFormat | null | undefined;

const getIslamicFormatter = (): Intl.DateTimeFormat | null => {
  if (islamicFormatter !== undefined) return islamicFormatter;
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    // Verify the runtime actually honoured the calendar request.
    const resolved = formatter.resolvedOptions().calendar ?? '';
    islamicFormatter = resolved.startsWith('islamic') ? formatter : null;
  } catch {
    islamicFormatter = null;
  }
  return islamicFormatter;
};

/**
 * Hijri date for a Gregorian date. `offsetDays` lets the user nudge the result
 * to match their local moon-sighting convention.
 */
export const toHijri = (date: Date, offsetDays = 0): HijriDate => {
  const shifted = addDays(date, offsetDays);
  const formatter = getIslamicFormatter();
  if (formatter) {
    try {
      const parts = formatter.formatToParts(shifted);
      const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
      const day = Number(get('day'));
      const month = Number(get('month'));
      const year = Number(get('year').replace(/[^\d]/g, ''));
      if (day && month && year) {
        return { day, month, year, monthName: HIJRI_MONTHS[(month - 1) % 12] ?? '' };
      }
    } catch {
      /* fall through to the arithmetic calendar */
    }
  }
  return tabularHijri(shifted);
};

export const formatHijri = (hijri: HijriDate): string =>
  `${hijri.day} ${hijri.monthName} ${hijri.year} AH`;
