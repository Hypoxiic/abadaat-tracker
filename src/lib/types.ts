/**
 * Core domain types for the Abadaat Tracker.
 *
 * Everything the app persists is described here. The whole application state
 * lives in a single versioned JSON blob (see `store.ts`), which keeps
 * export/import, migration and testing straightforward.
 */

export const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerKey = (typeof PRAYER_KEYS)[number];

/** How a prayer was performed on a given day. */
export type PrayerStatus = 'none' | 'jamaah' | 'ontime' | 'late' | 'qadha';

/** Statuses that count as the prayer having been performed. */
export const COMPLETED_STATUSES: PrayerStatus[] = ['jamaah', 'ontime', 'late', 'qadha'];

export interface QuranEntry {
  id: string;
  /** 1-114 */
  surah: number;
  startAyah: number;
  endAyah: number;
  pages: number;
  minutes: number;
  notes: string;
  createdAt: string;
}

export interface DuaLogEntry {
  /** Id of the du'a in the library. */
  duaId: string;
  count: number;
}

export interface DayRecord {
  /** ISO calendar date, `yyyy-MM-dd`, in the user's local timezone. */
  date: string;
  prayers: Record<PrayerKey, PrayerStatus>;
  quran: QuranEntry[];
  /** Map of dhikr preset id -> count recited that day. */
  dhikr: Record<string, number>;
  duas: DuaLogEntry[];
  /** Free-form reflection for the day. */
  notes: string;
}

export interface DhikrPreset {
  id: string;
  name: string;
  arabic: string;
  transliteration: string;
  translation: string;
  /** Daily target count. 0 means "no target". */
  target: number;
  colorScheme: string;
  /** Built-in presets cannot be deleted, only hidden. */
  builtIn: boolean;
  hidden: boolean;
}

export interface DuaItem {
  id: string;
  name: string;
  arabic: string;
  translation: string;
  category: string;
  link: string;
  notes: string;
  favourite: boolean;
  builtIn: boolean;
  hidden: boolean;
}

export interface GeoLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  /** IANA timezone, e.g. `Europe/London`. */
  timeZone: string;
}

export type CalculationMethodKey =
  | 'jafari'
  | 'tehran'
  | 'mwl'
  | 'isna'
  | 'egypt'
  | 'makkah'
  | 'karachi';

export type AsrMadhab = 'standard' | 'hanafi';
export type MidnightMode = 'standard' | 'jafari';
export type HighLatitudeRule = 'none' | 'middleOfNight' | 'seventhOfNight' | 'angleBased';
export type TimeFormat = '12h' | '24h';

export interface Goals {
  quranPages: number;
  dhikrCount: number;
  duaCount: number;
}

export interface Settings {
  locationId: string;
  customLocation: GeoLocation | null;
  method: CalculationMethodKey;
  asrMadhab: AsrMadhab;
  midnightMode: MidnightMode;
  highLatitudeRule: HighLatitudeRule;
  timeFormat: TimeFormat;
  /** Per-prayer manual correction in minutes. */
  adjustments: Record<PrayerKey, number>;
  notificationsEnabled: boolean;
  /** How many minutes before a prayer to notify. */
  notificationLeadMinutes: number;
  showHijriDate: boolean;
  /** Manual correction for the Hijri date, in days. */
  hijriOffset: number;
  goals: Goals;
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn: 0 | 1;
  reducedMotion: boolean;
}

export interface AppState {
  version: number;
  settings: Settings;
  /** Keyed by `yyyy-MM-dd`. */
  days: Record<string, DayRecord>;
  dhikrPresets: DhikrPreset[];
  duas: DuaItem[];
  quran: {
    /** Where the reader left off. */
    bookmark: { surah: number; ayah: number };
    /** How many complete khatms have been finished. */
    khatmCount: number;
    /** Pages read towards the current khatm. */
    khatmPages: number;
  };
}
