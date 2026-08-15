import type { IconType } from 'react-icons';
import { FiBookOpen, FiCalendar, FiGrid, FiSettings } from 'react-icons/fi';
import { FaKaaba, FaRegStar } from 'react-icons/fa';
import { LuHeartHandshake } from 'react-icons/lu';

export interface NavItem {
  label: string;
  path: string;
  icon: IconType;
  /** Shown in the mobile bottom bar. */
  primary: boolean;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: FiGrid,
    primary: true,
    description: 'Today at a glance',
  },
  {
    label: 'Prayer',
    path: '/prayer',
    icon: FaKaaba,
    primary: true,
    description: 'Salah and prayer times',
  },
  {
    label: "Qur'an",
    path: '/quran',
    icon: FiBookOpen,
    primary: true,
    description: 'Reading log and khatm progress',
  },
  {
    label: 'Dhikr',
    path: '/dhikr',
    icon: FaRegStar,
    primary: true,
    description: 'Tasbih counters',
  },
  {
    label: "Du'a",
    path: '/dua',
    icon: LuHeartHandshake,
    primary: true,
    description: 'Supplications and ziyarat',
  },
  {
    label: 'History',
    path: '/history',
    icon: FiCalendar,
    primary: false,
    description: 'Trends, streaks and past days',
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: FiSettings,
    primary: false,
    description: 'Location, method and data',
  },
];

export const PRIMARY_NAV_ITEMS = NAV_ITEMS.filter((item) => item.primary);
