import { useEffect, useRef } from 'react';
import { toDateKey } from '../lib/dates';
import { PRAYER_TIME_KEYS, TIME_LABELS, formatTime, getPrayerTimes } from '../lib/prayerTimes';
import { useSettings } from './appState';
import { settingsToOptions } from './usePrayerTimes';

export const notificationsSupported = (): boolean =>
  typeof window !== 'undefined' && 'Notification' in window;

export const notificationPermission = (): NotificationPermission | 'unsupported' =>
  notificationsSupported() ? Notification.permission : 'unsupported';

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!notificationsSupported()) return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
};

/**
 * Prayer time reminders — one of the features the README listed as "future".
 *
 * Checks once a minute and fires a notification when a prayer is within the
 * configured lead time. Each prayer fires at most once per day.
 */
export const usePrayerNotifications = (): void => {
  const settings = useSettings();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!settings.notificationsEnabled) return undefined;
    if (!notificationsSupported() || Notification.permission !== 'granted') return undefined;

    const options = settingsToOptions(settings);
    const leadMs = settings.notificationLeadMinutes * 60_000;

    const check = () => {
      const now = new Date();
      const dateKey = toDateKey(now);
      const times = getPrayerTimes(now, options);

      PRAYER_TIME_KEYS.forEach((key) => {
        const at = times[key];
        const marker = `${dateKey}:${key}`;
        if (firedRef.current.has(marker)) return;

        const msUntil = at.getTime() - now.getTime();
        if (msUntil > leadMs || msUntil < -60_000) return;

        firedRef.current.add(marker);
        const label = TIME_LABELS[key];
        const timeText = formatTime(at, settings.timeFormat, options.location.timeZone);
        const body =
          msUntil > 30_000
            ? `${label} begins at ${timeText} — in ${Math.round(msUntil / 60000)} minutes.`
            : `It is time for ${label} (${timeText}).`;

        try {
          // eslint-disable-next-line no-new
          new Notification('Abadaat Tracker', { body, tag: marker, icon: '/favicon.svg' });
        } catch {
          /* some browsers require a service worker; fail quietly */
        }
      });

      // Keep the fired set from growing without bound.
      if (firedRef.current.size > 40) {
        firedRef.current = new Set(
          Array.from(firedRef.current).filter((marker) => marker.startsWith(dateKey)),
        );
      }
    };

    check();
    const timer = window.setInterval(check, 60_000);
    return () => window.clearInterval(timer);
  }, [settings]);
};
