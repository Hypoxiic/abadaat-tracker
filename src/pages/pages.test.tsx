import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, createMemoryStorage } from '../test/utils';
import { createStore } from '../lib/store';
import { todayKey } from '../lib/dates';
import { countCompletedPrayers, getDay, totalDhikr } from '../lib/stats';
import Dashboard from './Dashboard';
import PrayerTracker from './PrayerTracker';
import QuranTracker from './QuranTracker';
import DhikrTracker from './DhikrTracker';
import DuaTracker from './DuaTracker';
import History from './History';
import SettingsPage from './Settings';
import NotFound from './NotFound';

const freshStore = () => createStore(createMemoryStorage());

describe('Dashboard', () => {
  it('renders the day summary with zeroed stats for a new user', () => {
    renderWithProviders(<Dashboard />, { store: freshStore() });
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('0/5')).toBeInTheDocument();
  });

  it('records a prayer straight from the dashboard and persists it', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<Dashboard />, { store });

    await user.click(screen.getByRole('button', { name: /Fajr.*Mark as prayed on time/i }));

    expect(getDay(store.getState(), todayKey()).prayers.fajr).toBe('ontime');
    expect(await screen.findByText('1/5')).toBeInTheDocument();
  });

  it('marks every prayer at once', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<Dashboard />, { store });

    await user.click(screen.getByRole('button', { name: 'Mark all' }));

    expect(countCompletedPrayers(getDay(store.getState(), todayKey()))).toBe(5);
  });

  it('shows an empty state rather than invented chart data (regression)', () => {
    renderWithProviders(<Dashboard />, { store: freshStore() });
    expect(screen.getByText(/No history yet/i)).toBeInTheDocument();
  });

  it('reads the streak from stored data', () => {
    const store = freshStore();
    store.actions.setAllPrayers(todayKey(), 'ontime');
    renderWithProviders(<Dashboard />, { store });
    expect(screen.getByText(/day prayer streak/i)).toBeInTheDocument();
  });
});

describe('PrayerTracker', () => {
  it('lists all five prayers with their times', () => {
    renderWithProviders(<PrayerTracker />, { store: freshStore() });
    ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach((name) => {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    });
  });

  it('records how a prayer was performed', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<PrayerTracker />, { store });

    await user.click(screen.getByRole('button', { name: /Change how Dhuhr was prayed/i }));
    await user.click(await screen.findByRole('menuitem', { name: /Qadha/i }));

    expect(store.getState().days[todayKey()].prayers.dhuhr).toBe('qadha');
  });

  it('saves a reflection note for the day', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<PrayerTracker />, { store });

    await user.type(screen.getByLabelText(/Notes for this day/i), 'Alhamdulillah');

    await waitFor(() => {
      expect(store.getState().days[todayKey()].notes).toBe('Alhamdulillah');
    });
  });

  it('navigates to the previous day', async () => {
    const { user } = renderWithProviders(<PrayerTracker />, { store: freshStore() });
    expect(screen.getByText('Today')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Previous day/i }));

    expect(await screen.findByText('Yesterday')).toBeInTheDocument();
  });

  it('does not allow navigating into the future', () => {
    renderWithProviders(<PrayerTracker />, { store: freshStore() });
    expect(screen.getByRole('button', { name: /Next day/i })).toBeDisabled();
  });

  it('shows the Qibla bearing', () => {
    renderWithProviders(<PrayerTracker />, { store: freshStore() });
    expect(screen.getByText(/Qibla direction/i)).toBeInTheDocument();
    expect(screen.getByText(/km$/)).toBeInTheDocument();
  });
});

describe('QuranTracker', () => {
  it('offers surahs by name, not just by number (regression)', () => {
    renderWithProviders(<QuranTracker />, { store: freshStore() });
    const select = screen.getByLabelText('Surah') as HTMLSelectElement;
    expect(select.options).toHaveLength(114);
    expect(select.options[0].textContent).toContain('Al-Fatihah');
    expect(select.options[17].textContent).toContain('Al-Kahf');
  });

  it('records a reading and advances the bookmark', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<QuranTracker />, { store });

    await user.click(screen.getByRole('button', { name: /Add reading/i }));

    const day = getDay(store.getState(), todayKey());
    expect(day.quran).toHaveLength(1);
    expect(store.getState().quran.bookmark.ayah).toBeGreaterThan(1);
  });

  it('rejects an inverted ayah range', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<QuranTracker />, { store });

    const from = screen.getByLabelText('From ayah');
    await user.clear(from);
    await user.type(from, '5');

    expect(await screen.findByText(/must not come before/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add reading/i })).toBeDisabled();
  });

  it('does not inflate totals when re-rendered (regression)', () => {
    const store = freshStore();
    store.actions.addQuranEntry(todayKey(), {
      surah: 2,
      startAyah: 1,
      endAyah: 20,
      pages: 3,
      minutes: 0,
      notes: '',
    });

    const { unmount } = renderWithProviders(<QuranTracker />, { store });
    expect(screen.getAllByText(/^3 pages?$/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^6 pages?$/)).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<QuranTracker />, { store });
    expect(screen.getAllByText(/^3 pages?$/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^6 pages?$/)).not.toBeInTheDocument();
  });
});

describe('DhikrTracker', () => {
  it('shows the built-in counters', () => {
    renderWithProviders(<DhikrTracker />, { store: freshStore() });
    expect(screen.getByText('Salawat')).toBeInTheDocument();
    expect(screen.getByText('Istighfar')).toBeInTheDocument();
  });

  it('counts up and down', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<DhikrTracker />, { store });

    const countButton = screen.getByRole('button', { name: 'Count Salawat' });

    await user.click(countButton);
    await user.click(countButton);
    expect(store.getState().days[todayKey()].dhikr.salawat).toBe(2);

    await user.click(screen.getByRole('button', { name: /Decrease Salawat/i }));
    expect(store.getState().days[todayKey()].dhikr.salawat).toBe(1);
  });

  it('opens a full-size counter', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<DhikrTracker />, { store });

    await user.click(screen.getByRole('button', { name: /Open Salawat counter/i }));
    const bigButton = await screen.findByRole('button', { name: /Count Salawat/i });

    await user.click(bigButton);
    expect(store.getState().days[todayKey()].dhikr.salawat).toBe(1);
  });

  it('keeps each day separate (regression)', () => {
    // The old tracker kept one global counter that never reset, so an old
    // day's recitations were still on screen today.
    const store = freshStore();
    store.actions.adjustDhikr('2020-01-01', 'salawat', 500);

    renderWithProviders(<DhikrTracker />, { store });

    expect(totalDhikr(getDay(store.getState(), todayKey()))).toBe(0);
    expect(screen.queryByText('500')).not.toBeInTheDocument();
  });

  it('resets the day', async () => {
    const store = freshStore();
    store.actions.adjustDhikr(todayKey(), 'salawat', 20);
    const { user } = renderWithProviders(<DhikrTracker />, { store });

    await user.click(screen.getByRole('button', { name: /Reset this day/i }));

    expect(totalDhikr(getDay(store.getState(), todayKey()))).toBe(0);
  });
});

describe('DuaTracker', () => {
  it('renders the library without crashing (regression for the hook-in-loop bug)', () => {
    // The previous implementation called useColorModeValue inside a .map(),
    // so the page crashed as soon as the number of entries changed.
    renderWithProviders(<DuaTracker />, { store: freshStore() });
    expect(screen.getByText("Du'a al-Faraj")).toBeInTheDocument();
    expect(screen.getByText("Du'a Kumayl")).toBeInTheDocument();
  });

  it('still renders after the logged entries change', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<DuaTracker />, { store });

    await user.click(
      screen.getByRole('button', { name: "Record a recitation of Du'a Kumayl" }),
    );

    expect(store.getState().days[todayKey()].duas).toEqual([{ duaId: 'dua-kumayl', count: 1 }]);
    // The page must survive the re-render: it now appears in both the library
    // and the day's log, and the counter badge is shown.
    expect(screen.getAllByText("Du'a Kumayl").length).toBe(2);
    expect(screen.getByText('1× today')).toBeInTheDocument();
  });

  it('filters by search text', async () => {
    const { user } = renderWithProviders(<DuaTracker />, { store: freshStore() });

    await user.type(screen.getByLabelText(/Search du'as/i), 'kumayl');

    await waitFor(() => {
      expect(screen.queryByText("Du'a al-Sabah")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Du'a Kumayl")).toBeInTheDocument();
  });

  it('toggles a favourite', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<DuaTracker />, { store });

    await user.click(screen.getByRole('button', { name: /Add Du'a al-Sabah to favourites/i }));

    expect(store.getState().duas.find((dua) => dua.id === 'dua-sabah')?.favourite).toBe(true);
  });
});

describe('History', () => {
  it('shows an empty state before anything is recorded', () => {
    renderWithProviders(<History />, { store: freshStore() });
    expect(screen.getByText(/No history yet/i)).toBeInTheDocument();
  });

  it('summarises recorded days', () => {
    const store = freshStore();
    store.actions.setAllPrayers(todayKey(), 'ontime');
    renderWithProviders(<History />, { store });

    expect(screen.getByText(/Current streak/i)).toBeInTheDocument();
    expect(screen.getByText(/Best streak/i)).toBeInTheDocument();
  });
});

describe('Settings', () => {
  it('changes the calculation method', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<SettingsPage />, { store });

    await user.selectOptions(screen.getByLabelText('Method'), 'karachi');

    expect(store.getState().settings.method).toBe('karachi');
  });

  it('changes the location', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<SettingsPage />, { store });

    await user.selectOptions(screen.getByLabelText('City'), 'najaf');

    expect(store.getState().settings.locationId).toBe('najaf');
  });

  it('updates a daily goal', async () => {
    const store = freshStore();
    const { user } = renderWithProviders(<SettingsPage />, { store });

    const input = screen.getByLabelText("Qur'an pages");
    await user.clear(input);
    await user.type(input, '10');

    await waitFor(() => expect(store.getState().settings.goals.quranPages).toBe(10));
  });

  it('asks for confirmation before clearing data, and keeps settings', async () => {
    const store = freshStore();
    store.actions.setAllPrayers(todayKey(), 'ontime');
    store.actions.updateSettings({ timeFormat: '24h' });
    const { user } = renderWithProviders(<SettingsPage />, { store });

    await user.click(screen.getByRole('button', { name: /Clear tracked data/i }));
    expect(await screen.findByText(/Clear tracked data\?/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Clear everything/i }));

    expect(store.getState().days).toEqual({});
    expect(store.getState().settings.timeFormat).toBe('24h');
  });

  it('can be dismissed without clearing anything', async () => {
    const store = freshStore();
    store.actions.setAllPrayers(todayKey(), 'ontime');
    const { user } = renderWithProviders(<SettingsPage />, { store });

    await user.click(screen.getByRole('button', { name: /Clear tracked data/i }));
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(Object.keys(store.getState().days)).toHaveLength(1);
  });
});

describe('NotFound', () => {
  it('reports the missing path instead of silently redirecting (regression)', () => {
    renderWithProviders(<NotFound />, { store: freshStore(), route: '/nowhere' });
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('/nowhere')).toBeInTheDocument();
  });
});
