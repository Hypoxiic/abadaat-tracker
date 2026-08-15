import type { PrayerStatus } from '../lib/types';

/** How a prayer can be recorded, in the order shown in the menu. */
export const STATUS_OPTIONS: Array<{
  value: PrayerStatus;
  label: string;
  colorScheme: string;
  hint: string;
}> = [
  { value: 'jamaah', label: "In jama'ah", colorScheme: 'brand', hint: 'Prayed in congregation' },
  { value: 'ontime', label: 'On time', colorScheme: 'green', hint: 'Prayed within its time' },
  { value: 'late', label: 'Late', colorScheme: 'yellow', hint: 'Prayed near the end of its time' },
  { value: 'qadha', label: 'Qadha', colorScheme: 'orange', hint: 'Made up after its time' },
  { value: 'none', label: 'Not recorded', colorScheme: 'gray', hint: 'Clear this prayer' },
];

export const statusMeta = (status: PrayerStatus) =>
  STATUS_OPTIONS.find((option) => option.value === status) ?? STATUS_OPTIONS[4];
