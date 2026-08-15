import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  STORAGE_KEY,
  createDefaultState,
  createStore,
  loadState,
  migrateLegacyData,
  sanitiseState,
} from './store';
import { todayKey } from './dates';
import { getDay, totalDhikr, totalQuranPages } from './stats';
import { BUILT_IN_DHIKR } from '../data/dhikr';

/** An isolated in-memory Storage implementation for each test. */
const makeStorage = (): Storage => {
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

let storage: Storage;
beforeEach(() => {
  storage = makeStorage();
});

describe('sanitiseState', () => {
  it('returns defaults for junk input', () => {
    expect(sanitiseState(null).version).toBe(createDefaultState().version);
    expect(sanitiseState('nonsense').days).toEqual({});
    expect(sanitiseState(42).dhikrPresets.length).toBe(BUILT_IN_DHIKR.length);
  });

  it('drops day records with invalid keys', () => {
    const state = sanitiseState({
      days: {
        '2025-06-10': { prayers: { fajr: 'ontime' } },
        'not-a-date': { prayers: { fajr: 'ontime' } },
        '2025-02-30': { prayers: { fajr: 'ontime' } },
      },
    });
    expect(Object.keys(state.days)).toEqual(['2025-06-10']);
  });

  it('coerces legacy boolean prayer values', () => {
    const state = sanitiseState({
      days: { '2025-06-10': { prayers: { fajr: true, dhuhr: false, asr: 'qadha' } } },
    });
    expect(state.days['2025-06-10'].prayers.fajr).toBe('ontime');
    expect(state.days['2025-06-10'].prayers.dhuhr).toBe('none');
    expect(state.days['2025-06-10'].prayers.asr).toBe('qadha');
  });

  it('clamps out-of-range settings', () => {
    const state = sanitiseState({
      settings: {
        adjustments: { fajr: 9999, dhuhr: -9999 },
        notificationLeadMinutes: 500,
        hijriOffset: 42,
        method: 'not-a-method',
        goals: { quranPages: -5 },
      },
    });
    expect(state.settings.adjustments.fajr).toBe(120);
    expect(state.settings.adjustments.dhuhr).toBe(-120);
    expect(state.settings.notificationLeadMinutes).toBe(60);
    expect(state.settings.hijriOffset).toBe(3);
    expect(state.settings.method).toBe('jafari');
    expect(state.settings.goals.quranPages).toBe(0);
  });

  it('always restores the built-in dhikr and du\'a libraries', () => {
    const state = sanitiseState({ dhikrPresets: [], duas: [] });
    expect(state.dhikrPresets.length).toBe(BUILT_IN_DHIKR.length);
    expect(state.duas.length).toBeGreaterThan(0);
  });

  it('preserves user edits to built-in entries', () => {
    const state = sanitiseState({
      dhikrPresets: [{ id: 'salawat', name: 'Salawat', target: 500, builtIn: true }],
    });
    expect(state.dhikrPresets.find((p) => p.id === 'salawat')?.target).toBe(500);
  });
});

describe('legacy migration', () => {
  it('imports prayer, Qur\'an and dhikr data from the old keys', () => {
    storage.setItem(
      'prayerData_2025-06-09',
      JSON.stringify({ fajr: true, dhuhr: true, asr: false, maghrib: true, isha: false }),
    );
    storage.setItem(
      'quran_entries_2025-06-09',
      JSON.stringify([{ id: 'a', surah: 2, startVerse: 1, endVerse: 5, pages: 2, notes: 'x' }]),
    );
    storage.setItem(
      'dhikrData',
      JSON.stringify({ items: [{ id: '1', name: 'SubhanAllah', count: 33 }], totalCount: 33 }),
    );
    storage.setItem('quranData', JSON.stringify({ pagesRead: 120, dailyGoal: 6 }));

    const migrated = migrateLegacyData(storage);
    expect(migrated).not.toBeNull();

    const day = migrated!.days['2025-06-09'];
    expect(day.prayers.fajr).toBe('ontime');
    expect(day.prayers.asr).toBe('none');
    expect(day.quran[0].startAyah).toBe(1);
    expect(day.quran[0].endAyah).toBe(5);
    expect(migrated!.quran.khatmPages).toBe(120);
    expect(migrated!.settings.goals.quranPages).toBe(6);
    expect(totalDhikr(migrated!.days[todayKey()])).toBe(33);
  });

  it('returns null when there is nothing to migrate', () => {
    expect(migrateLegacyData(storage)).toBeNull();
  });

  it('ignores corrupt legacy values instead of throwing', () => {
    storage.setItem('prayerData_2025-06-09', '{not json');
    storage.setItem('quran_entries_2025-06-09', 'also bad');
    expect(() => migrateLegacyData(storage)).not.toThrow();
  });

  it('runs automatically on first load and is persisted', () => {
    storage.setItem('prayerData_2025-06-09', JSON.stringify({ fajr: true }));
    const state = loadState(storage);
    expect(state.days['2025-06-09'].prayers.fajr).toBe('ontime');
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull();
  });
});

describe('loadState', () => {
  it('recovers from a corrupt stored document', () => {
    storage.setItem(STORAGE_KEY, '{ this is not json');
    expect(() => loadState(storage)).not.toThrow();
    expect(loadState(storage).days).toEqual({});
  });
});

describe('store actions', () => {
  it('records and clears prayers', () => {
    const store = createStore(storage);
    store.actions.setPrayerStatus('2025-06-10', 'fajr', 'jamaah');
    expect(store.getState().days['2025-06-10'].prayers.fajr).toBe('jamaah');

    store.actions.setPrayerStatus('2025-06-10', 'fajr', 'none');
    // An empty day is pruned rather than left behind.
    expect(store.getState().days['2025-06-10']).toBeUndefined();
  });

  it('toggles a prayer between recorded and cleared', () => {
    const store = createStore(storage);
    store.actions.togglePrayer('2025-06-10', 'asr');
    expect(store.getState().days['2025-06-10'].prayers.asr).toBe('ontime');
    store.actions.togglePrayer('2025-06-10', 'asr');
    expect(store.getState().days['2025-06-10']).toBeUndefined();
  });

  it('marks every prayer at once', () => {
    const store = createStore(storage);
    store.actions.setAllPrayers('2025-06-10', 'ontime');
    const day = store.getState().days['2025-06-10'];
    expect(Object.values(day.prayers).every((status) => status === 'ontime')).toBe(true);
  });

  it('persists across store instances', () => {
    const first = createStore(storage);
    first.actions.setPrayerStatus('2025-06-10', 'isha', 'qadha');

    const second = createStore(storage);
    expect(second.getState().days['2025-06-10'].prayers.isha).toBe('qadha');
  });

  it('notifies subscribers exactly once per change', () => {
    const store = createStore(storage);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.actions.setPrayerStatus('2025-06-10', 'fajr', 'ontime');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.actions.setPrayerStatus('2025-06-10', 'dhuhr', 'ontime');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('adds and removes Qur\'an entries without double counting (regression)', () => {
    const store = createStore(storage);
    const entry = { surah: 2, startAyah: 1, endAyah: 20, pages: 3, minutes: 10, notes: '' };

    store.actions.addQuranEntry('2025-06-10', entry);
    expect(totalQuranPages(getDay(store.getState(), '2025-06-10'))).toBe(3);

    // Reading the state repeatedly must never inflate the totals, which is what
    // the old `quran_stats` accumulator did on every render.
    for (let i = 0; i < 5; i += 1) {
      expect(totalQuranPages(getDay(store.getState(), '2025-06-10'))).toBe(3);
    }

    const id = store.getState().days['2025-06-10'].quran[0].id;
    store.actions.deleteQuranEntry('2025-06-10', id);
    expect(store.getState().days['2025-06-10']).toBeUndefined();
  });

  it('rolls the khatm counter over at 604 pages', () => {
    const store = createStore(storage);
    store.actions.addKhatmPages(600);
    expect(store.getState().quran.khatmCount).toBe(0);
    store.actions.addKhatmPages(10);
    expect(store.getState().quran.khatmCount).toBe(1);
    expect(store.getState().quran.khatmPages).toBe(6);
  });

  it('never lets khatm pages go negative', () => {
    const store = createStore(storage);
    store.actions.addKhatmPages(-50);
    expect(store.getState().quran.khatmPages).toBe(0);
  });

  it('counts dhikr per day and never below zero', () => {
    const store = createStore(storage);
    store.actions.adjustDhikr('2025-06-10', 'salawat', 5);
    store.actions.adjustDhikr('2025-06-10', 'salawat', -2);
    expect(store.getState().days['2025-06-10'].dhikr.salawat).toBe(3);

    store.actions.adjustDhikr('2025-06-10', 'salawat', -99);
    expect(store.getState().days['2025-06-10']).toBeUndefined();
  });

  it('keeps dhikr counts separate for each day (regression)', () => {
    // The old tracker stored one global counter that never reset, so yesterday's
    // recitations were still showing today.
    const store = createStore(storage);
    store.actions.adjustDhikr('2025-06-09', 'salawat', 100);
    store.actions.adjustDhikr('2025-06-10', 'salawat', 7);
    expect(store.getState().days['2025-06-09'].dhikr.salawat).toBe(100);
    expect(store.getState().days['2025-06-10'].dhikr.salawat).toBe(7);
  });

  it('logs and unlogs du\'as', () => {
    const store = createStore(storage);
    store.actions.logDua('2025-06-10', 'dua-kumayl');
    store.actions.logDua('2025-06-10', 'dua-kumayl');
    expect(store.getState().days['2025-06-10'].duas).toEqual([{ duaId: 'dua-kumayl', count: 2 }]);

    store.actions.logDua('2025-06-10', 'dua-kumayl', -1);
    expect(store.getState().days['2025-06-10'].duas[0].count).toBe(1);

    store.actions.unlogDua('2025-06-10', 'dua-kumayl');
    expect(store.getState().days['2025-06-10']).toBeUndefined();
  });

  it('hides built-in items rather than deleting them', () => {
    const store = createStore(storage);
    store.actions.removeDhikrPreset('salawat');
    const preset = store.getState().dhikrPresets.find((item) => item.id === 'salawat');
    expect(preset).toBeDefined();
    expect(preset?.hidden).toBe(true);
  });

  it('deletes custom items outright', () => {
    const store = createStore(storage);
    store.actions.upsertDhikrPreset({
      id: 'custom-1',
      name: 'My dhikr',
      arabic: '',
      transliteration: '',
      translation: '',
      target: 10,
      colorScheme: 'brand',
      builtIn: false,
      hidden: false,
    });
    expect(store.getState().dhikrPresets.some((p) => p.id === 'custom-1')).toBe(true);

    store.actions.removeDhikrPreset('custom-1');
    expect(store.getState().dhikrPresets.some((p) => p.id === 'custom-1')).toBe(false);
  });

  it('validates settings on update', () => {
    const store = createStore(storage);
    store.actions.updateSettings({ notificationLeadMinutes: 9999 });
    expect(store.getState().settings.notificationLeadMinutes).toBe(60);
  });

  it('keeps settings when clearing tracked data', () => {
    const store = createStore(storage);
    store.actions.updateSettings({ timeFormat: '24h', locationId: 'najaf' });
    store.actions.setPrayerStatus('2025-06-10', 'fajr', 'ontime');

    store.actions.clearAll();
    expect(store.getState().days).toEqual({});
    expect(store.getState().settings.timeFormat).toBe('24h');
    expect(store.getState().settings.locationId).toBe('najaf');
  });

  it('imports an exported document round-trip', () => {
    const store = createStore(storage);
    store.actions.setPrayerStatus('2025-06-10', 'maghrib', 'jamaah');
    store.actions.adjustDhikr('2025-06-10', 'tahlil', 12);
    const exported = JSON.parse(JSON.stringify(store.getState()));

    const fresh = createStore(makeStorage());
    fresh.actions.replaceState(exported);
    expect(fresh.getState().days['2025-06-10'].prayers.maghrib).toBe('jamaah');
    expect(fresh.getState().days['2025-06-10'].dhikr.tahlil).toBe(12);
  });

  it('survives a storage backend that throws on write', () => {
    const hostile = {
      ...makeStorage(),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    } as Storage;
    const store = createStore(hostile);
    expect(() => store.actions.setPrayerStatus('2025-06-10', 'fajr', 'ontime')).not.toThrow();
    expect(store.getState().days['2025-06-10'].prayers.fajr).toBe('ontime');
  });
});
