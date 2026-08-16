# Abadaat Tracker

A private, offline-first tracker for daily acts of worship — salah, Qur'an, dhikr and du'a —
with prayer times computed from the sun's position for any location on earth.

Everything is stored in your own browser. There is no account, no server and no analytics.

**Live app: [abadaat.netlify.app](https://abadaat.netlify.app/)**

---

## Features

### Prayer

- **Real prayer times.** Fajr, sunrise, Dhuhr, Asr, Maghrib, Isha and Islamic midnight are
  derived from the sun's declination and the equation of time for your exact coordinates and
  date — not looked up from a table.
- **Seven calculation methods**, including Ja'fari (the default), Tehran, MWL, ISNA, Egypt,
  Umm al-Qura and Karachi, with a standard/Hanafi Asr option and per-prayer minute adjustments.
- **Islamic midnight**, measured either from sunset to Fajr (Ja'fari) or sunset to sunrise, so
  the app can tell you when Isha becomes qadha.
- **High-latitude rules** (middle of the night, one seventh, angle based) for summers in the
  north, where twilight never truly ends.
- **Status per prayer** — in jama'ah, on time, late, or qadha — not just a tick.
- **Qibla finder** with the true bearing and distance to the Kaaba, plus a live compass on
  devices that expose one.
- **Prayer reminders** through browser notifications, at a lead time you choose.

### Qur'an

- Log readings by surah and ayah range, with all 114 surahs listed by name in Arabic and
  transliteration.
- Page counts estimated from the ayah range, and editable.
- A bookmark that advances automatically so you always know where you left off.
- Khatm progress towards the 604-page mushaf, with a completed-khatm counter.

### Dhikr

- Per-day counters, so each day's remembrance is recorded separately.
- Built-in adhkar with Arabic text, transliteration and daily targets, plus your own.
- A full-screen counter with a large tap target, keyboard support and haptic feedback.
- The Tasbih of az-Zahra (a) — 34 · 33 · 33 — tracked as a set.

### Du'a

- A starter library of du'as and ziyarat from the Shia tradition, each with Arabic,
  translation, category and a link to its source.
- Search, category filters and favourites.
- Add, edit or hide any entry.

### Review

- A dashboard showing today at a glance and your real trends — never simulated data.
- History with a 13-week activity heatmap, per-metric charts, current and best streaks, and a
  breakdown of which prayers slip most often.
- Daily goals for pages, dhikr and du'a.
- Hijri date, with a manual offset for your local moon sighting.

### Throughout

- Responsive from phone to desktop: a sidebar on large screens, a drawer and thumb-reachable
  bottom bar on small ones.
- Light and dark themes, following your system preference by default.
- Keyboard accessible, with a skip link, visible focus rings and labelled controls.
- Export and import your data as JSON.

---

## Getting started

```bash
npm install
```

```bash
npm run dev
```

The app runs at <http://localhost:5173>.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Typecheck and build for production |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run coverage` | Run tests with a coverage report |
| `npm run typecheck` | Typecheck without emitting |
| `npm run lint` | Lint with ESLint |
| `npm run verify` | Typecheck, test and build |

---

## How prayer times are calculated

For a given date and location the app computes the sun's declination and the equation of time,
then solves for the hour angle at which the sun reaches each required altitude:

| Time | Definition |
| --- | --- |
| Fajr | Sun at the method's twilight angle below the horizon (16° for Ja'fari) |
| Sunrise | Sun's upper limb on the horizon, allowing for refraction |
| Dhuhr | Solar noon |
| Asr | Shadow equal to an object's height (×2 for Hanafi), plus its noon shadow |
| Maghrib | Sun 4° below the horizon (Ja'fari), or sunset for other methods |
| Isha | Sun 14° below the horizon (Ja'fari), or the method's angle or offset |
| Islamic midnight | Midpoint from sunset to Fajr (Ja'fari) or to sunrise |

Results are converted to the location's civil time using its IANA time zone, so daylight saving
is handled correctly. Cross-checked against published sun data for Milton Keynes at the
equinox, midsummer and midwinter — see `src/lib/prayerTimes.test.ts`.

---

## Architecture

```
src/
  lib/          prayerTimes, dates + Hijri, store, stats, types  (pure, fully tested)
  data/         surahs, locations, dhikr presets, du'a library
  hooks/        app state, prayer times, notifications
  components/   layout, shared UI, feature components
  pages/        Dashboard, Prayer, Qur'an, Dhikr, Du'a, History, Settings
  theme/        Chakra theme, palette and semantic tokens
```

**State.** All application state lives in a single validated, versioned document under the
`abadaat:state` key. Reads and writes go through `src/lib/store.ts`, which sanitises anything
it loads — corrupt or hostile data can never crash the app. Data written by earlier versions
(the `prayerData_*`, `quran_entries_*`, `dhikrData`, `dua_entries_*` keys) is migrated
automatically on first load and left in place.

**Derived values.** Streaks, totals and chart series are pure functions of stored days
(`src/lib/stats.ts`). Nothing is cached, so the displayed numbers cannot drift from the data.

---

## Testing

```bash
npm test
```

166 tests across seven suites: the astronomy and calendar maths, the store and its migrations,
derived statistics, the static data tables, every page, and the app shell. Several are explicit
regression tests for defects fixed in this version — deterministic prayer times, per-day dhikr
counters, non-inflating Qur'an totals, a streak that survives a day in progress, a du'a page
that no longer violates the rules of hooks, and navigation that exists on mobile.

---

## Privacy

All data stays in this browser's local storage. Nothing is transmitted anywhere. Clearing your
browser data will delete it, so export a backup from **Settings → Your data** first.

---

## Acknowledgements

- Prayer time calculation follows the approach used by [PrayTimes](http://praytimes.org/).
- Du'a texts and links reference [Duas.org](https://www.duas.org/) and
  [Al-Islam.org](https://www.al-islam.org/).

## Licence

MIT.
