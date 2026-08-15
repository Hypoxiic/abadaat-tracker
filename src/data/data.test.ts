import { describe, expect, it } from 'vitest';
import {
  SURAHS,
  TOTAL_QURAN_AYAHS,
  TOTAL_QURAN_PAGES,
  estimatePages,
  getSurah,
  surahLabel,
} from './surahs';
import {
  CUSTOM_LOCATION_ID,
  DEFAULT_LOCATION_ID,
  PRESET_LOCATIONS,
  findPresetLocation,
  resolveLocation,
} from './locations';
import { BUILT_IN_DHIKR, TASBIH_AL_ZAHRA_IDS } from './dhikr';
import { BUILT_IN_DUAS, DUA_CATEGORIES } from './duas';

describe('surah data', () => {
  it('contains all 114 surahs in order', () => {
    expect(SURAHS).toHaveLength(114);
    SURAHS.forEach((surah, index) => {
      expect(surah.number).toBe(index + 1);
      expect(surah.name.length).toBeGreaterThan(0);
      expect(surah.arabic.length).toBeGreaterThan(0);
    });
  });

  it('totals 6236 ayahs', () => {
    expect(TOTAL_QURAN_AYAHS).toBe(6236);
  });

  it('has well-known ayah counts', () => {
    expect(getSurah(1)?.ayahs).toBe(7);
    expect(getSurah(2)?.ayahs).toBe(286);
    expect(getSurah(18)?.ayahs).toBe(110);
    expect(getSurah(36)?.ayahs).toBe(83);
    expect(getSurah(112)?.ayahs).toBe(4);
    expect(getSurah(114)?.ayahs).toBe(6);
  });

  it('has non-decreasing start pages within the mushaf', () => {
    for (let i = 1; i < SURAHS.length; i += 1) {
      expect(SURAHS[i].startPage).toBeGreaterThanOrEqual(SURAHS[i - 1].startPage);
      expect(SURAHS[i].startPage).toBeLessThanOrEqual(TOTAL_QURAN_PAGES);
    }
  });

  it('labels surahs by number and name', () => {
    expect(surahLabel(1)).toBe('1. Al-Fatihah');
    expect(surahLabel(999)).toBe('Surah 999');
  });

  describe('estimatePages', () => {
    it('returns zero for an unknown surah', () => {
      expect(estimatePages(200, 1, 5)).toBe(0);
    });

    it('estimates a whole surah as close to its page span', () => {
      // Al-Baqarah runs from page 2 to page 49, so about 48 pages.
      const pages = estimatePages(2, 1, 286);
      expect(pages).toBeGreaterThan(40);
      expect(pages).toBeLessThan(55);
    });

    it('scales with the size of the range', () => {
      const small = estimatePages(2, 1, 10);
      const large = estimatePages(2, 1, 100);
      expect(large).toBeGreaterThan(small);
    });

    it('never returns a negative value for an inverted range', () => {
      expect(estimatePages(2, 100, 10)).toBe(0);
    });

    it('clamps an end ayah beyond the surah length', () => {
      expect(estimatePages(1, 1, 500)).toBe(estimatePages(1, 1, 7));
    });
  });
});

describe('locations', () => {
  it('has unique ids and valid coordinates', () => {
    const ids = new Set<string>();
    PRESET_LOCATIONS.forEach((location) => {
      expect(ids.has(location.id)).toBe(false);
      ids.add(location.id);
      expect(location.latitude).toBeGreaterThanOrEqual(-90);
      expect(location.latitude).toBeLessThanOrEqual(90);
      expect(location.longitude).toBeGreaterThanOrEqual(-180);
      expect(location.longitude).toBeLessThanOrEqual(180);
    });
  });

  it('uses time zones the runtime recognises', () => {
    PRESET_LOCATIONS.forEach((location) => {
      expect(() =>
        new Intl.DateTimeFormat('en-GB', { timeZone: location.timeZone }).format(new Date()),
      ).not.toThrow();
    });
  });

  it('includes the default location', () => {
    expect(findPresetLocation(DEFAULT_LOCATION_ID)).toBeDefined();
  });

  it('resolves a custom location when one is set', () => {
    const custom = {
      id: 'custom',
      name: 'Somewhere',
      country: '',
      latitude: 10,
      longitude: 20,
      timeZone: 'UTC',
    };
    expect(resolveLocation(CUSTOM_LOCATION_ID, custom)).toBe(custom);
  });

  it('falls back to a preset for an unknown id', () => {
    expect(resolveLocation('does-not-exist', null).id).toBe(DEFAULT_LOCATION_ID);
  });

  it('falls back to a preset when custom is selected but unset', () => {
    expect(resolveLocation(CUSTOM_LOCATION_ID, null).id).toBe(DEFAULT_LOCATION_ID);
  });
});

describe('dhikr presets', () => {
  it('has unique ids and sensible targets', () => {
    const ids = new Set<string>();
    BUILT_IN_DHIKR.forEach((preset) => {
      expect(ids.has(preset.id)).toBe(false);
      ids.add(preset.id);
      expect(preset.builtIn).toBe(true);
      expect(preset.target).toBeGreaterThanOrEqual(0);
    });
  });

  it('defines the Tasbih of az-Zahra as 34, 33, 33', () => {
    const targets = TASBIH_AL_ZAHRA_IDS.map(
      (id) => BUILT_IN_DHIKR.find((preset) => preset.id === id)?.target,
    );
    expect(targets).toEqual([34, 33, 33]);
  });
});

describe("du'a library", () => {
  it('has unique ids and known categories', () => {
    const ids = new Set<string>();
    BUILT_IN_DUAS.forEach((dua) => {
      expect(ids.has(dua.id)).toBe(false);
      ids.add(dua.id);
      expect(DUA_CATEGORIES).toContain(dua.category);
      expect(dua.builtIn).toBe(true);
    });
  });

  it('only links to http(s) URLs', () => {
    BUILT_IN_DUAS.forEach((dua) => {
      if (!dua.link) return;
      const url = new URL(dua.link);
      expect(['http:', 'https:']).toContain(url.protocol);
    });
  });
});
