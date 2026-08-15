/**
 * The 114 surahs of the Qur'an.
 *
 * Tuple layout: [number, transliterated name, Arabic name, ayah count,
 * revelation place, first page in the 604-page Madani mushaf].
 *
 * Page numbers follow the standard Madani mushaf and are used for the khatm
 * progress estimate; other printings paginate slightly differently.
 */
type SurahTuple = [number, string, string, number, 'Makkah' | 'Madinah', number];

const RAW: SurahTuple[] = [
  [1, 'Al-Fatihah', 'الفاتحة', 7, 'Makkah', 1],
  [2, 'Al-Baqarah', 'البقرة', 286, 'Madinah', 2],
  [3, "Ali 'Imran", 'آل عمران', 200, 'Madinah', 50],
  [4, 'An-Nisa', 'النساء', 176, 'Madinah', 77],
  [5, "Al-Ma'idah", 'المائدة', 120, 'Madinah', 106],
  [6, "Al-An'am", 'الأنعام', 165, 'Makkah', 128],
  [7, "Al-A'raf", 'الأعراف', 206, 'Makkah', 151],
  [8, 'Al-Anfal', 'الأنفال', 75, 'Madinah', 177],
  [9, 'At-Tawbah', 'التوبة', 129, 'Madinah', 187],
  [10, 'Yunus', 'يونس', 109, 'Makkah', 208],
  [11, 'Hud', 'هود', 123, 'Makkah', 221],
  [12, 'Yusuf', 'يوسف', 111, 'Makkah', 235],
  [13, "Ar-Ra'd", 'الرعد', 43, 'Madinah', 249],
  [14, 'Ibrahim', 'إبراهيم', 52, 'Makkah', 255],
  [15, 'Al-Hijr', 'الحجر', 99, 'Makkah', 262],
  [16, 'An-Nahl', 'النحل', 128, 'Makkah', 267],
  [17, 'Al-Isra', 'الإسراء', 111, 'Makkah', 282],
  [18, 'Al-Kahf', 'الكهف', 110, 'Makkah', 293],
  [19, 'Maryam', 'مريم', 98, 'Makkah', 305],
  [20, 'Ta-Ha', 'طه', 135, 'Makkah', 312],
  [21, 'Al-Anbiya', 'الأنبياء', 112, 'Makkah', 322],
  [22, 'Al-Hajj', 'الحج', 78, 'Madinah', 332],
  [23, "Al-Mu'minun", 'المؤمنون', 118, 'Makkah', 342],
  [24, 'An-Nur', 'النور', 64, 'Madinah', 350],
  [25, 'Al-Furqan', 'الفرقان', 77, 'Makkah', 359],
  [26, "Ash-Shu'ara", 'الشعراء', 227, 'Makkah', 367],
  [27, 'An-Naml', 'النمل', 93, 'Makkah', 377],
  [28, 'Al-Qasas', 'القصص', 88, 'Makkah', 385],
  [29, "Al-'Ankabut", 'العنكبوت', 69, 'Makkah', 396],
  [30, 'Ar-Rum', 'الروم', 60, 'Makkah', 404],
  [31, 'Luqman', 'لقمان', 34, 'Makkah', 411],
  [32, 'As-Sajdah', 'السجدة', 30, 'Makkah', 415],
  [33, 'Al-Ahzab', 'الأحزاب', 73, 'Madinah', 418],
  [34, 'Saba', 'سبأ', 54, 'Makkah', 428],
  [35, 'Fatir', 'فاطر', 45, 'Makkah', 434],
  [36, 'Ya-Sin', 'يس', 83, 'Makkah', 440],
  [37, 'As-Saffat', 'الصافات', 182, 'Makkah', 446],
  [38, 'Sad', 'ص', 88, 'Makkah', 453],
  [39, 'Az-Zumar', 'الزمر', 75, 'Makkah', 458],
  [40, 'Ghafir', 'غافر', 85, 'Makkah', 467],
  [41, 'Fussilat', 'فصلت', 54, 'Makkah', 477],
  [42, 'Ash-Shura', 'الشورى', 53, 'Makkah', 483],
  [43, 'Az-Zukhruf', 'الزخرف', 89, 'Makkah', 489],
  [44, 'Ad-Dukhan', 'الدخان', 59, 'Makkah', 496],
  [45, 'Al-Jathiyah', 'الجاثية', 37, 'Makkah', 499],
  [46, 'Al-Ahqaf', 'الأحقاف', 35, 'Makkah', 502],
  [47, 'Muhammad', 'محمد', 38, 'Madinah', 507],
  [48, 'Al-Fath', 'الفتح', 29, 'Madinah', 511],
  [49, 'Al-Hujurat', 'الحجرات', 18, 'Madinah', 515],
  [50, 'Qaf', 'ق', 45, 'Makkah', 518],
  [51, 'Adh-Dhariyat', 'الذاريات', 60, 'Makkah', 520],
  [52, 'At-Tur', 'الطور', 49, 'Makkah', 523],
  [53, 'An-Najm', 'النجم', 62, 'Makkah', 526],
  [54, 'Al-Qamar', 'القمر', 55, 'Makkah', 528],
  [55, 'Ar-Rahman', 'الرحمن', 78, 'Madinah', 531],
  [56, "Al-Waqi'ah", 'الواقعة', 96, 'Makkah', 534],
  [57, 'Al-Hadid', 'الحديد', 29, 'Madinah', 537],
  [58, 'Al-Mujadilah', 'المجادلة', 22, 'Madinah', 542],
  [59, 'Al-Hashr', 'الحشر', 24, 'Madinah', 545],
  [60, 'Al-Mumtahanah', 'الممتحنة', 13, 'Madinah', 549],
  [61, 'As-Saff', 'الصف', 14, 'Madinah', 551],
  [62, "Al-Jumu'ah", 'الجمعة', 11, 'Madinah', 553],
  [63, 'Al-Munafiqun', 'المنافقون', 11, 'Madinah', 554],
  [64, 'At-Taghabun', 'التغابن', 18, 'Madinah', 556],
  [65, 'At-Talaq', 'الطلاق', 12, 'Madinah', 558],
  [66, 'At-Tahrim', 'التحريم', 12, 'Madinah', 560],
  [67, 'Al-Mulk', 'الملك', 30, 'Makkah', 562],
  [68, 'Al-Qalam', 'القلم', 52, 'Makkah', 564],
  [69, 'Al-Haqqah', 'الحاقة', 52, 'Makkah', 566],
  [70, "Al-Ma'arij", 'المعارج', 44, 'Makkah', 568],
  [71, 'Nuh', 'نوح', 28, 'Makkah', 570],
  [72, 'Al-Jinn', 'الجن', 28, 'Makkah', 572],
  [73, 'Al-Muzzammil', 'المزمل', 20, 'Makkah', 574],
  [74, 'Al-Muddaththir', 'المدثر', 56, 'Makkah', 575],
  [75, 'Al-Qiyamah', 'القيامة', 40, 'Makkah', 577],
  [76, 'Al-Insan', 'الإنسان', 31, 'Madinah', 578],
  [77, 'Al-Mursalat', 'المرسلات', 50, 'Makkah', 580],
  [78, 'An-Naba', 'النبأ', 40, 'Makkah', 582],
  [79, "An-Nazi'at", 'النازعات', 46, 'Makkah', 583],
  [80, "'Abasa", 'عبس', 42, 'Makkah', 585],
  [81, 'At-Takwir', 'التكوير', 29, 'Makkah', 586],
  [82, 'Al-Infitar', 'الانفطار', 19, 'Makkah', 587],
  [83, 'Al-Mutaffifin', 'المطففين', 36, 'Makkah', 587],
  [84, 'Al-Inshiqaq', 'الانشقاق', 25, 'Makkah', 589],
  [85, 'Al-Buruj', 'البروج', 22, 'Makkah', 590],
  [86, 'At-Tariq', 'الطارق', 17, 'Makkah', 591],
  [87, "Al-A'la", 'الأعلى', 19, 'Makkah', 591],
  [88, 'Al-Ghashiyah', 'الغاشية', 26, 'Makkah', 592],
  [89, 'Al-Fajr', 'الفجر', 30, 'Makkah', 593],
  [90, 'Al-Balad', 'البلد', 20, 'Makkah', 594],
  [91, 'Ash-Shams', 'الشمس', 15, 'Makkah', 595],
  [92, 'Al-Layl', 'الليل', 21, 'Makkah', 595],
  [93, 'Ad-Duha', 'الضحى', 11, 'Makkah', 596],
  [94, 'Ash-Sharh', 'الشرح', 8, 'Makkah', 596],
  [95, 'At-Tin', 'التين', 8, 'Makkah', 597],
  [96, "Al-'Alaq", 'العلق', 19, 'Makkah', 597],
  [97, 'Al-Qadr', 'القدر', 5, 'Makkah', 598],
  [98, 'Al-Bayyinah', 'البينة', 8, 'Madinah', 598],
  [99, 'Az-Zalzalah', 'الزلزلة', 8, 'Madinah', 599],
  [100, "Al-'Adiyat", 'العاديات', 11, 'Makkah', 599],
  [101, "Al-Qari'ah", 'القارعة', 11, 'Makkah', 600],
  [102, 'At-Takathur', 'التكاثر', 8, 'Makkah', 600],
  [103, "Al-'Asr", 'العصر', 3, 'Makkah', 601],
  [104, 'Al-Humazah', 'الهمزة', 9, 'Makkah', 601],
  [105, 'Al-Fil', 'الفيل', 5, 'Makkah', 601],
  [106, 'Quraysh', 'قريش', 4, 'Makkah', 602],
  [107, "Al-Ma'un", 'الماعون', 7, 'Makkah', 602],
  [108, 'Al-Kawthar', 'الكوثر', 3, 'Makkah', 602],
  [109, 'Al-Kafirun', 'الكافرون', 6, 'Makkah', 603],
  [110, 'An-Nasr', 'النصر', 3, 'Madinah', 603],
  [111, 'Al-Masad', 'المسد', 5, 'Makkah', 603],
  [112, 'Al-Ikhlas', 'الإخلاص', 4, 'Makkah', 604],
  [113, 'Al-Falaq', 'الفلق', 5, 'Makkah', 604],
  [114, 'An-Nas', 'الناس', 6, 'Makkah', 604],
];

export interface Surah {
  number: number;
  name: string;
  arabic: string;
  ayahs: number;
  revelation: 'Makkah' | 'Madinah';
  startPage: number;
}

export const SURAHS: Surah[] = RAW.map(
  ([number, name, arabic, ayahs, revelation, startPage]) => ({
    number,
    name,
    arabic,
    ayahs,
    revelation,
    startPage,
  }),
);

export const TOTAL_QURAN_PAGES = 604;
export const TOTAL_QURAN_AYAHS = SURAHS.reduce((sum, surah) => sum + surah.ayahs, 0);

export const getSurah = (number: number): Surah | undefined =>
  SURAHS.find((surah) => surah.number === number);

export const surahLabel = (number: number): string => {
  const surah = getSurah(number);
  return surah ? `${surah.number}. ${surah.name}` : `Surah ${number}`;
};

/**
 * Rough page count for an ayah range, interpolating within the surah's page
 * span. Always at least a fraction of a page so short readings still register.
 */
export const estimatePages = (surahNumber: number, startAyah: number, endAyah: number): number => {
  const surah = getSurah(surahNumber);
  if (!surah) return 0;
  const next = getSurah(surahNumber + 1);
  const span = Math.max((next?.startPage ?? TOTAL_QURAN_PAGES) - surah.startPage, 1);
  const ayahs = Math.max(0, Math.min(endAyah, surah.ayahs) - Math.max(startAyah, 1) + 1);
  const pages = (ayahs / surah.ayahs) * span;
  return Math.round(pages * 10) / 10;
};
