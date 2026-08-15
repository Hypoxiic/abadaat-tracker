import type { DhikrPreset } from '../lib/types';

/**
 * Built-in dhikr counters. Users can add their own, edit targets, or hide
 * these; they are never destroyed, so a hidden preset keeps its history.
 */
export const BUILT_IN_DHIKR: DhikrPreset[] = [
  {
    id: 'tasbih-allahu-akbar',
    name: 'Allahu Akbar',
    arabic: 'اللهُ أَكْبَر',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    target: 34,
    colorScheme: 'brand',
    builtIn: true,
    hidden: false,
  },
  {
    id: 'tasbih-alhamdulillah',
    name: 'Alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّه',
    transliteration: 'Alhamdulillah',
    translation: 'All praise belongs to Allah',
    target: 33,
    colorScheme: 'teal',
    builtIn: true,
    hidden: false,
  },
  {
    id: 'tasbih-subhanallah',
    name: 'SubhanAllah',
    arabic: 'سُبْحَانَ اللَّه',
    transliteration: 'Subhan Allah',
    translation: 'Glory be to Allah',
    target: 33,
    colorScheme: 'cyan',
    builtIn: true,
    hidden: false,
  },
  {
    id: 'salawat',
    name: 'Salawat',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّد',
    transliteration: "Allahumma salli 'ala Muhammadin wa Aali Muhammad",
    translation: 'O Allah, send blessings upon Muhammad and the family of Muhammad',
    target: 100,
    colorScheme: 'purple',
    builtIn: true,
    hidden: false,
  },
  {
    id: 'istighfar',
    name: 'Istighfar',
    arabic: 'أَسْتَغْفِرُ اللَّهَ رَبِّي وَأَتُوبُ إِلَيْه',
    transliteration: 'Astaghfirullaha Rabbi wa atubu ilayh',
    translation: 'I seek forgiveness from Allah, my Lord, and I turn to Him in repentance',
    target: 70,
    colorScheme: 'orange',
    builtIn: true,
    hidden: false,
  },
  {
    id: 'tahlil',
    name: 'Tahlil',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّه',
    transliteration: 'La ilaha illa Allah',
    translation: 'There is no god but Allah',
    target: 100,
    colorScheme: 'green',
    builtIn: true,
    hidden: false,
  },
  {
    id: 'hawqala',
    name: 'Hawqala',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّه',
    transliteration: 'La hawla wa la quwwata illa billah',
    translation: 'There is no power nor strength except with Allah',
    target: 100,
    colorScheme: 'blue',
    builtIn: true,
    hidden: false,
  },
];

/** The Tasbih of Sayyida Fatima (a), in the order it is recited. */
export const TASBIH_AL_ZAHRA_IDS = [
  'tasbih-allahu-akbar',
  'tasbih-alhamdulillah',
  'tasbih-subhanallah',
];
