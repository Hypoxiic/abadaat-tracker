/**
 * Application state store.
 *
 * The previous version scattered data across a dozen unrelated localStorage
 * keys (`abadaat_stats`, `prayerData_<date>`, `quranData`, `quran_stats`,
 * `dhikrData`, `dua_entries_<date>`, ...) which drifted out of sync and, in the
 * Qur'an tracker, double-counted totals on every render.
 *
 * Everything now lives in one validated, versioned document. Legacy keys are
 * migrated on first load and then left untouched, so nothing is lost.
 */

import { BUILT_IN_DHIKR } from '../data/dhikr';
import { BUILT_IN_DUAS } from '../data/duas';
import { DEFAULT_LOCATION_ID, guessLocationFromTimeZone } from '../data/locations';
import { isValidDateKey, todayKey } from './dates';
import { PRAYER_KEYS } from './types';
import type {
  AppState,
  DayRecord,
  DhikrPreset,
  DuaItem,
  PrayerKey,
  PrayerStatus,
  QuranEntry,
  Settings,
} from './types';

export const STORAGE_KEY = 'abadaat:state';
export const STATE_VERSION = 2;

/* ------------------------------------------------------------------ */
/* Defaults                                                             */
/* ------------------------------------------------------------------ */

export const createDefaultSettings = (): Settings => ({
  locationId: guessLocationFromTimeZone()?.id ?? DEFAULT_LOCATION_ID,
  customLocation: null,
  method: 'jafari',
  asrMadhab: 'standard',
  midnightMode: 'jafari',
  highLatitudeRule: 'middleOfNight',
  timeFormat: '12h',
  adjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  notificationsEnabled: false,
  notificationLeadMinutes: 10,
  showHijriDate: true,
  hijriOffset: 0,
  goals: { quranPages: 4, dhikrCount: 100, duaCount: 1 },
  weekStartsOn: 1,
  reducedMotion: false,
});

export const createEmptyDay = (date: string): DayRecord => ({
  date,
  prayers: { fajr: 'none', dhuhr: 'none', asr: 'none', maghrib: 'none', isha: 'none' },
  quran: [],
  dhikr: {},
  duas: [],
  notes: '',
});

export const createDefaultState = (): AppState => ({
  version: STATE_VERSION,
  settings: createDefaultSettings(),
  days: {},
  dhikrPresets: BUILT_IN_DHIKR.map((preset) => ({ ...preset })),
  duas: BUILT_IN_DUAS.map((dua) => ({ ...dua })),
  quran: { bookmark: { surah: 1, ayah: 1 }, khatmCount: 0, khatmPages: 0 },
});

/* ------------------------------------------------------------------ */
/* Validation                                                           */
/* ------------------------------------------------------------------ */

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const num = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const str = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const bool = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;

const VALID_STATUSES: PrayerStatus[] = ['none', 'jamaah', 'ontime', 'late', 'qadha'];

const sanitiseSettings = (raw: unknown): Settings => {
  const defaults = createDefaultSettings();
  if (!isObject(raw)) return defaults;

  const adjustmentsRaw = isObject(raw.adjustments) ? raw.adjustments : {};
  const adjustments = { ...defaults.adjustments };
  PRAYER_KEYS.forEach((key) => {
    adjustments[key] = Math.max(-120, Math.min(120, Math.round(num(adjustmentsRaw[key], 0))));
  });

  const goalsRaw = isObject(raw.goals) ? raw.goals : {};

  return {
    locationId: str(raw.locationId, defaults.locationId),
    customLocation: isObject(raw.customLocation)
      ? {
          id: 'custom',
          name: str(raw.customLocation.name, 'Custom location'),
          country: str(raw.customLocation.country, ''),
          latitude: Math.max(-90, Math.min(90, num(raw.customLocation.latitude, 0))),
          longitude: Math.max(-180, Math.min(180, num(raw.customLocation.longitude, 0))),
          timeZone: str(
            raw.customLocation.timeZone,
            Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          ),
        }
      : null,
    method: oneOf(
      raw.method,
      ['jafari', 'tehran', 'mwl', 'isna', 'egypt', 'makkah', 'karachi'] as const,
      defaults.method,
    ),
    asrMadhab: oneOf(raw.asrMadhab, ['standard', 'hanafi'] as const, defaults.asrMadhab),
    midnightMode: oneOf(raw.midnightMode, ['standard', 'jafari'] as const, defaults.midnightMode),
    highLatitudeRule: oneOf(
      raw.highLatitudeRule,
      ['none', 'middleOfNight', 'seventhOfNight', 'angleBased'] as const,
      defaults.highLatitudeRule,
    ),
    timeFormat: oneOf(raw.timeFormat, ['12h', '24h'] as const, defaults.timeFormat),
    adjustments,
    notificationsEnabled: bool(raw.notificationsEnabled, defaults.notificationsEnabled),
    notificationLeadMinutes: Math.max(
      0,
      Math.min(60, Math.round(num(raw.notificationLeadMinutes, defaults.notificationLeadMinutes))),
    ),
    showHijriDate: bool(raw.showHijriDate, defaults.showHijriDate),
    hijriOffset: Math.max(-3, Math.min(3, Math.round(num(raw.hijriOffset, 0)))),
    goals: {
      quranPages: Math.max(0, Math.round(num(goalsRaw.quranPages, defaults.goals.quranPages))),
      dhikrCount: Math.max(0, Math.round(num(goalsRaw.dhikrCount, defaults.goals.dhikrCount))),
      duaCount: Math.max(0, Math.round(num(goalsRaw.duaCount, defaults.goals.duaCount))),
    },
    weekStartsOn: num(raw.weekStartsOn, defaults.weekStartsOn) === 0 ? 0 : 1,
    reducedMotion: bool(raw.reducedMotion, defaults.reducedMotion),
  };
};

const sanitiseQuranEntry = (raw: unknown, index: number): QuranEntry | null => {
  if (!isObject(raw)) return null;
  const surah = Math.max(1, Math.min(114, Math.round(num(raw.surah, 1))));
  const startAyah = Math.max(1, Math.round(num(raw.startAyah ?? raw.startVerse, 1)));
  const endAyah = Math.max(startAyah, Math.round(num(raw.endAyah ?? raw.endVerse, startAyah)));
  return {
    id: str(raw.id, `entry-${index}-${surah}`),
    surah,
    startAyah,
    endAyah,
    pages: Math.max(0, num(raw.pages, 0)),
    minutes: Math.max(0, Math.round(num(raw.minutes, 0))),
    notes: str(raw.notes, ''),
    createdAt: str(raw.createdAt, new Date(0).toISOString()),
  };
};

const sanitiseDay = (dateKey: string, raw: unknown): DayRecord => {
  const day = createEmptyDay(dateKey);
  if (!isObject(raw)) return day;

  if (isObject(raw.prayers)) {
    PRAYER_KEYS.forEach((key) => {
      const value = (raw.prayers as Record<string, unknown>)[key];
      if (value === true) day.prayers[key] = 'ontime';
      else if (value === false) day.prayers[key] = 'none';
      else day.prayers[key] = oneOf(value, VALID_STATUSES, 'none');
    });
  }

  if (Array.isArray(raw.quran)) {
    day.quran = raw.quran
      .map((entry, index) => sanitiseQuranEntry(entry, index))
      .filter((entry): entry is QuranEntry => entry !== null);
  }

  if (isObject(raw.dhikr)) {
    Object.entries(raw.dhikr).forEach(([id, value]) => {
      const count = Math.max(0, Math.round(num(value, 0)));
      if (count > 0) day.dhikr[id] = count;
    });
  }

  if (Array.isArray(raw.duas)) {
    day.duas = raw.duas
      .map((entry) =>
        isObject(entry)
          ? { duaId: str(entry.duaId, ''), count: Math.max(1, Math.round(num(entry.count, 1))) }
          : null,
      )
      .filter((entry): entry is { duaId: string; count: number } => !!entry && !!entry.duaId);
  }

  day.notes = str(raw.notes, '');
  return day;
};

const sanitiseDhikrPreset = (raw: unknown): DhikrPreset | null => {
  if (!isObject(raw) || typeof raw.id !== 'string' || !raw.id) return null;
  return {
    id: raw.id,
    name: str(raw.name, 'Dhikr'),
    arabic: str(raw.arabic, ''),
    transliteration: str(raw.transliteration, ''),
    translation: str(raw.translation, ''),
    target: Math.max(0, Math.min(100_000, Math.round(num(raw.target, 0)))),
    colorScheme: str(raw.colorScheme, 'brand'),
    builtIn: bool(raw.builtIn, false),
    hidden: bool(raw.hidden, false),
  };
};

const sanitiseDua = (raw: unknown): DuaItem | null => {
  if (!isObject(raw) || typeof raw.id !== 'string' || !raw.id) return null;
  return {
    id: raw.id,
    name: str(raw.name, "Du'a"),
    arabic: str(raw.arabic, ''),
    translation: str(raw.translation, ''),
    category: str(raw.category, 'Other'),
    link: str(raw.link, ''),
    notes: str(raw.notes, ''),
    favourite: bool(raw.favourite, false),
    builtIn: bool(raw.builtIn, false),
    hidden: bool(raw.hidden, false),
  };
};

/**
 * Coerce arbitrary parsed JSON into a valid `AppState`.
 * Anything unrecognised is dropped rather than allowed to crash the app.
 */
export const sanitiseState = (raw: unknown): AppState => {
  const state = createDefaultState();
  if (!isObject(raw)) return state;

  state.settings = sanitiseSettings(raw.settings);

  if (isObject(raw.days)) {
    Object.entries(raw.days).forEach(([key, value]) => {
      if (isValidDateKey(key)) state.days[key] = sanitiseDay(key, value);
    });
  }

  if (Array.isArray(raw.dhikrPresets)) {
    const parsed = raw.dhikrPresets
      .map(sanitiseDhikrPreset)
      .filter((preset): preset is DhikrPreset => preset !== null);
    // Built-ins are always present, but keep any user edits to them.
    const byId = new Map(parsed.map((preset) => [preset.id, preset]));
    const merged = BUILT_IN_DHIKR.map((preset) => byId.get(preset.id) ?? { ...preset });
    parsed.forEach((preset) => {
      if (!merged.some((existing) => existing.id === preset.id)) merged.push(preset);
    });
    state.dhikrPresets = merged;
  }

  if (Array.isArray(raw.duas)) {
    const parsed = raw.duas.map(sanitiseDua).filter((dua): dua is DuaItem => dua !== null);
    const byId = new Map(parsed.map((dua) => [dua.id, dua]));
    const merged = BUILT_IN_DUAS.map((dua) => byId.get(dua.id) ?? { ...dua });
    parsed.forEach((dua) => {
      if (!merged.some((existing) => existing.id === dua.id)) merged.push(dua);
    });
    state.duas = merged;
  }

  if (isObject(raw.quran)) {
    const bookmark = isObject(raw.quran.bookmark) ? raw.quran.bookmark : {};
    state.quran = {
      bookmark: {
        surah: Math.max(1, Math.min(114, Math.round(num(bookmark.surah, 1)))),
        ayah: Math.max(1, Math.round(num(bookmark.ayah, 1))),
      },
      khatmCount: Math.max(0, Math.round(num(raw.quran.khatmCount, 0))),
      khatmPages: Math.max(0, num(raw.quran.khatmPages, 0)),
    };
  }

  return state;
};

/* ------------------------------------------------------------------ */
/* Legacy migration                                                     */
/* ------------------------------------------------------------------ */

const parseJson = (value: string | null): unknown => {
  if (value === null) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

/** Pull data out of the pre-v2 localStorage keys. */
export const migrateLegacyData = (storage: Storage): AppState | null => {
  let found = false;
  const state = createDefaultState();

  const keys: string[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key) keys.push(key);
  }

  const ensureDay = (dateKey: string): DayRecord => {
    if (!state.days[dateKey]) state.days[dateKey] = createEmptyDay(dateKey);
    return state.days[dateKey];
  };

  keys.forEach((key) => {
    const prayerMatch = key.match(/^prayerData_(\d{4}-\d{2}-\d{2})$/);
    if (prayerMatch && isValidDateKey(prayerMatch[1])) {
      const parsed = parseJson(storage.getItem(key));
      if (isObject(parsed)) {
        const day = ensureDay(prayerMatch[1]);
        PRAYER_KEYS.forEach((prayer) => {
          if (parsed[prayer] === true) {
            day.prayers[prayer] = 'ontime';
            found = true;
          }
        });
      }
      return;
    }

    const quranMatch = key.match(/^quran_entries_(\d{4}-\d{2}-\d{2})$/);
    if (quranMatch && isValidDateKey(quranMatch[1])) {
      const parsed = parseJson(storage.getItem(key));
      if (Array.isArray(parsed) && parsed.length > 0) {
        const day = ensureDay(quranMatch[1]);
        day.quran = parsed
          .map((entry, index) => sanitiseQuranEntry(entry, index))
          .filter((entry): entry is QuranEntry => entry !== null);
        found = true;
      }
      return;
    }

    const duaMatch = key.match(/^dua_entries_(\d{4}-\d{2}-\d{2})$/);
    if (duaMatch && isValidDateKey(duaMatch[1])) {
      const parsed = parseJson(storage.getItem(key));
      if (Array.isArray(parsed) && parsed.length > 0) {
        const day = ensureDay(duaMatch[1]);
        parsed.forEach((entry, index) => {
          if (!isObject(entry)) return;
          const id = `legacy-dua-${duaMatch[1]}-${index}`;
          state.duas.push({
            id,
            name: str(entry.name, "Du'a"),
            arabic: str(entry.arabicText ?? entry.arabic, ''),
            translation: str(entry.translation, ''),
            category: str(entry.category, 'Other'),
            link: str(entry.link, ''),
            notes: str(entry.notes, ''),
            favourite: bool(entry.favourite, false),
            builtIn: false,
            hidden: false,
          });
          if (entry.completed === true) day.duas.push({ duaId: id, count: 1 });
          found = true;
        });
      }
    }
  });

  const dhikrLegacy = parseJson(storage.getItem('dhikrData'));
  if (isObject(dhikrLegacy) && Array.isArray(dhikrLegacy.items)) {
    const today = ensureDay(todayKey());
    dhikrLegacy.items.forEach((item) => {
      if (!isObject(item)) return;
      const name = str(item.name, '').trim();
      if (!name) return;
      const existing = state.dhikrPresets.find(
        (preset) => preset.name.toLowerCase() === name.toLowerCase(),
      );
      const id = existing?.id ?? `legacy-dhikr-${str(item.id, name)}`;
      if (!existing) {
        state.dhikrPresets.push({
          id,
          name,
          arabic: '',
          transliteration: '',
          translation: '',
          target: 0,
          colorScheme: 'brand',
          builtIn: false,
          hidden: false,
        });
      }
      const count = Math.max(0, Math.round(num(item.count, 0)));
      if (count > 0) {
        today.dhikr[id] = (today.dhikr[id] ?? 0) + count;
        found = true;
      }
    });
  }

  const quranLegacy = parseJson(storage.getItem('quranData'));
  if (isObject(quranLegacy)) {
    const pages = Math.max(0, num(quranLegacy.pagesRead, 0));
    if (pages > 0) {
      state.quran.khatmPages = Math.min(pages, 604);
      found = true;
    }
    const goal = Math.round(num(quranLegacy.dailyGoal, 0));
    if (goal > 0) state.settings.goals.quranPages = goal;
  }

  const legacySettings = parseJson(storage.getItem('app_settings'));
  if (isObject(legacySettings)) {
    state.settings.notificationsEnabled = bool(legacySettings.notificationsEnabled, false);
    found = true;
  }

  return found ? state : null;
};

/* ------------------------------------------------------------------ */
/* Persistence                                                          */
/* ------------------------------------------------------------------ */

const memoryStorage = (): Storage => {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => void map.delete(key),
    setItem: (key: string, value: string) => void map.set(key, value),
  } as Storage;
};

export const getDefaultStorage = (): Storage => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Touch it: Safari private mode throws on write.
      const probe = '__abadaat_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return window.localStorage;
    }
  } catch {
    /* fall through to an in-memory store */
  }
  return memoryStorage();
};

export const loadState = (storage: Storage): AppState => {
  const stored = parseJson(storage.getItem(STORAGE_KEY));
  if (stored !== undefined) return sanitiseState(stored);

  const migrated = migrateLegacyData(storage);
  if (migrated) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    } catch {
      /* ignore quota failures */
    }
    return migrated;
  }

  return createDefaultState();
};

export const saveState = (storage: Storage, state: AppState): void => {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — the in-memory state stays authoritative */
  }
};

/* ------------------------------------------------------------------ */
/* Store                                                                */
/* ------------------------------------------------------------------ */

export interface Store {
  getState: () => AppState;
  setState: (updater: (state: AppState) => AppState) => void;
  subscribe: (listener: () => void) => () => void;
  actions: Actions;
}

/** Drop day records that carry no information, keeping storage tidy. */
const isEmptyDay = (day: DayRecord): boolean =>
  PRAYER_KEYS.every((key) => day.prayers[key] === 'none') &&
  day.quran.length === 0 &&
  Object.keys(day.dhikr).length === 0 &&
  day.duas.length === 0 &&
  day.notes.trim() === '';

const withDay = (
  state: AppState,
  dateKey: string,
  mutate: (day: DayRecord) => DayRecord,
): AppState => {
  const current = state.days[dateKey] ?? createEmptyDay(dateKey);
  const next = mutate({
    ...current,
    prayers: { ...current.prayers },
    quran: [...current.quran],
    dhikr: { ...current.dhikr },
    duas: [...current.duas],
  });
  const days = { ...state.days };
  if (isEmptyDay(next)) delete days[dateKey];
  else days[dateKey] = next;
  return { ...state, days };
};

export interface Actions {
  setPrayerStatus: (dateKey: string, prayer: PrayerKey, status: PrayerStatus) => void;
  togglePrayer: (dateKey: string, prayer: PrayerKey) => void;
  setAllPrayers: (dateKey: string, status: PrayerStatus) => void;
  setDayNotes: (dateKey: string, notes: string) => void;
  addQuranEntry: (dateKey: string, entry: Omit<QuranEntry, 'id' | 'createdAt'>) => void;
  deleteQuranEntry: (dateKey: string, id: string) => void;
  setBookmark: (surah: number, ayah: number) => void;
  addKhatmPages: (pages: number) => void;
  resetKhatm: () => void;
  adjustDhikr: (dateKey: string, dhikrId: string, delta: number) => void;
  setDhikr: (dateKey: string, dhikrId: string, value: number) => void;
  resetDhikrForDay: (dateKey: string) => void;
  upsertDhikrPreset: (preset: DhikrPreset) => void;
  removeDhikrPreset: (id: string) => void;
  logDua: (dateKey: string, duaId: string, delta?: number) => void;
  unlogDua: (dateKey: string, duaId: string) => void;
  upsertDua: (dua: DuaItem) => void;
  removeDua: (id: string) => void;
  toggleDuaFavourite: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  replaceState: (state: AppState) => void;
  clearAll: () => void;
}

const randomId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const createStore = (storage: Storage = getDefaultStorage()): Store => {
  let state = loadState(storage);
  const listeners = new Set<() => void>();

  const setState = (updater: (current: AppState) => AppState) => {
    const next = updater(state);
    if (next === state) return;
    state = next;
    saveState(storage, state);
    listeners.forEach((listener) => listener());
  };

  const actions: Actions = {
    setPrayerStatus: (dateKey, prayer, status) =>
      setState((current) =>
        withDay(current, dateKey, (day) => {
          day.prayers[prayer] = status;
          return day;
        }),
      ),

    togglePrayer: (dateKey, prayer) =>
      setState((current) =>
        withDay(current, dateKey, (day) => {
          day.prayers[prayer] = day.prayers[prayer] === 'none' ? 'ontime' : 'none';
          return day;
        }),
      ),

    setAllPrayers: (dateKey, status) =>
      setState((current) =>
        withDay(current, dateKey, (day) => {
          PRAYER_KEYS.forEach((key) => {
            day.prayers[key] = status;
          });
          return day;
        }),
      ),

    setDayNotes: (dateKey, notes) =>
      setState((current) =>
        withDay(current, dateKey, (day) => {
          day.notes = notes;
          return day;
        }),
      ),

    addQuranEntry: (dateKey, entry) =>
      setState((current) =>
        withDay(current, dateKey, (day) => {
          day.quran = [
            ...day.quran,
            { ...entry, id: randomId('quran'), createdAt: new Date().toISOString() },
          ];
          return day;
        }),
      ),

    deleteQuranEntry: (dateKey, id) =>
      setState((current) =>
        withDay(current, dateKey, (day) => {
          day.quran = day.quran.filter((entry) => entry.id !== id);
          return day;
        }),
      ),

    setBookmark: (surah, ayah) =>
      setState((current) => ({
        ...current,
        quran: { ...current.quran, bookmark: { surah, ayah } },
      })),

    addKhatmPages: (pages) =>
      setState((current) => {
        let khatmPages = current.quran.khatmPages + pages;
        let khatmCount = current.quran.khatmCount;
        while (khatmPages >= 604) {
          khatmPages -= 604;
          khatmCount += 1;
        }
        return {
          ...current,
          quran: { ...current.quran, khatmPages: Math.max(0, khatmPages), khatmCount },
        };
      }),

    resetKhatm: () =>
      setState((current) => ({ ...current, quran: { ...current.quran, khatmPages: 0 } })),

    adjustDhikr: (dateKey, dhikrId, delta) =>
      setState((current) =>
        withDay(current, dateKey, (day) => {
          const next = Math.max(0, (day.dhikr[dhikrId] ?? 0) + delta);
          if (next === 0) delete day.dhikr[dhikrId];
          else day.dhikr[dhikrId] = next;
          return day;
        }),
      ),

    setDhikr: (dateKey, dhikrId, value) =>
      setState((current) =>
        withDay(current, dateKey, (day) => {
          const next = Math.max(0, Math.round(value));
          if (next === 0) delete day.dhikr[dhikrId];
          else day.dhikr[dhikrId] = next;
          return day;
        }),
      ),

    resetDhikrForDay: (dateKey) =>
      setState((current) =>
        withDay(current, dateKey, (day) => {
          day.dhikr = {};
          return day;
        }),
      ),

    upsertDhikrPreset: (preset) =>
      setState((current) => {
        const exists = current.dhikrPresets.some((item) => item.id === preset.id);
        return {
          ...current,
          dhikrPresets: exists
            ? current.dhikrPresets.map((item) => (item.id === preset.id ? preset : item))
            : [...current.dhikrPresets, preset],
        };
      }),

    removeDhikrPreset: (id) =>
      setState((current) => ({
        ...current,
        dhikrPresets: current.dhikrPresets
          .map((preset) =>
            preset.id === id && preset.builtIn ? { ...preset, hidden: true } : preset,
          )
          .filter((preset) => preset.id !== id || preset.builtIn),
      })),

    logDua: (dateKey, duaId, delta = 1) =>
      setState((current) =>
        withDay(current, dateKey, (day) => {
          const existing = day.duas.find((entry) => entry.duaId === duaId);
          if (existing) {
            const count = existing.count + delta;
            day.duas =
              count > 0
                ? day.duas.map((entry) => (entry.duaId === duaId ? { ...entry, count } : entry))
                : day.duas.filter((entry) => entry.duaId !== duaId);
          } else if (delta > 0) {
            day.duas = [...day.duas, { duaId, count: delta }];
          }
          return day;
        }),
      ),

    unlogDua: (dateKey, duaId) =>
      setState((current) =>
        withDay(current, dateKey, (day) => {
          day.duas = day.duas.filter((entry) => entry.duaId !== duaId);
          return day;
        }),
      ),

    upsertDua: (dua) =>
      setState((current) => {
        const exists = current.duas.some((item) => item.id === dua.id);
        return {
          ...current,
          duas: exists
            ? current.duas.map((item) => (item.id === dua.id ? dua : item))
            : [...current.duas, dua],
        };
      }),

    removeDua: (id) =>
      setState((current) => ({
        ...current,
        duas: current.duas
          .map((dua) => (dua.id === id && dua.builtIn ? { ...dua, hidden: true } : dua))
          .filter((dua) => dua.id !== id || dua.builtIn),
      })),

    toggleDuaFavourite: (id) =>
      setState((current) => ({
        ...current,
        duas: current.duas.map((dua) =>
          dua.id === id ? { ...dua, favourite: !dua.favourite } : dua,
        ),
      })),

    updateSettings: (patch) =>
      setState((current) => ({
        ...current,
        settings: sanitiseSettings({ ...current.settings, ...patch }),
      })),

    replaceState: (next) => setState(() => sanitiseState(next)),

    clearAll: () =>
      setState((current) => ({
        ...createDefaultState(),
        // Preferences survive a data wipe; only worship records are cleared.
        settings: current.settings,
      })),
  };

  return {
    getState: () => state,
    setState,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    actions,
  };
};

export const newId = randomId;
