import React, { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { FiAward, FiBookOpen, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { FaKaaba, FaRegStar } from 'react-icons/fa';
import { LuHeartHandshake } from 'react-icons/lu';
import PageHeader from '../components/ui/PageHeader';
import { EmptyState, SectionCard } from '../components/ui/Cards';
import TrendChart from '../components/TrendChart';
import { useAppState } from '../hooks/appState';
import {
  describeDateKey,
  formatLongDate,
  formatWeekday,
  fromDateKey,
  todayKey,
} from '../lib/dates';
import {
  buildHeatmap,
  buildSeries,
  computeBestPrayerStreak,
  computePrayerStreak,
  getDay,
  summariseDay,
  totalsForRange,
  type MetricKey,
} from '../lib/stats';
import { TIME_LABELS } from '../lib/prayerTimes';
import { PRAYER_KEYS } from '../lib/types';
import { statusMeta } from '../components/prayerStatus';
import { surahLabel } from '../data/surahs';

/** 13 weeks, plus enough slack to fill the first partial week. */
const HEATMAP_DAYS = 98;

const LEVEL_COLORS = [
  'blackAlpha.100',
  'brand.200',
  'brand.300',
  'brand.500',
  'brand.700',
];

const METRICS: Array<{ key: MetricKey; label: string; color: string; type: 'bar' | 'line' }> = [
  { key: 'prayers', label: 'Prayers', color: '#219e75', type: 'bar' },
  { key: 'quran', label: "Qur'an pages", color: '#316dbd', type: 'line' },
  { key: 'dhikr', label: 'Dhikr', color: '#c9992a', type: 'bar' },
  { key: 'dua', label: "Du'a", color: '#874cab', type: 'line' },
];

const History: React.FC = () => {
  const state = useAppState();
  const [selected, setSelected] = useState<string>(todayKey());
  const [range, setRange] = useState<30 | 90>(30);

  const heatmap = useMemo(() => buildHeatmap(state, HEATMAP_DAYS), [state]);
  const weekStartsOn = state.settings.weekStartsOn;
  // Pad the first column so each row is a fixed weekday.
  const leadingBlanks = useMemo(() => {
    const first = heatmap[0];
    if (!first) return 0;
    return (fromDateKey(first.date).getDay() - weekStartsOn + 7) % 7;
  }, [heatmap, weekStartsOn]);
  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        formatWeekday(new Date(2024, 0, 7 + weekStartsOn + index)),
      ),
    [weekStartsOn],
  );
  const totals = useMemo(() => totalsForRange(state, range), [state, range]);
  const streak = useMemo(() => computePrayerStreak(state), [state]);
  const best = useMemo(() => computeBestPrayerStreak(state), [state]);
  const day = getDay(state, selected);
  const summary = summariseDay(state, selected);
  const hasData = Object.keys(state.days).length > 0;

  return (
    <Box>
      <PageHeader
        eyebrow="Review"
        title="History"
        description="Your record over time. Select any day to see exactly what was tracked."
        actions={
          <HStack spacing={1}>
            {([30, 90] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={range === value ? 'solid' : 'outline'}
                onClick={() => setRange(value)}
              >
                {value} days
              </Button>
            ))}
          </HStack>
        }
      />

      {!hasData ? (
        <SectionCard>
          <EmptyState
            icon={FiCalendar}
            title="No history yet"
            description="Once you start recording prayers, reading and dhikr, your trends and streaks will appear here."
          />
        </SectionCard>
      ) : (
        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={{ base: 3, md: 4 }}>
            <SectionCard>
              <Stat>
                <StatLabel color="text.muted">Current streak</StatLabel>
                <StatNumber>{streak}</StatNumber>
                <Text fontSize="xs" color="text.muted">
                  consecutive complete days
                </Text>
              </Stat>
            </SectionCard>
            <SectionCard>
              <Stat>
                <StatLabel color="text.muted">Best streak</StatLabel>
                <StatNumber>{best}</StatNumber>
                <Text fontSize="xs" color="text.muted">
                  your personal record
                </Text>
              </Stat>
            </SectionCard>
            <SectionCard>
              <Stat>
                <StatLabel color="text.muted">Prayers kept</StatLabel>
                <StatNumber>
                  {totals.prayersPossible
                    ? Math.round((totals.prayersCompleted / totals.prayersPossible) * 100)
                    : 0}
                  %
                </StatNumber>
                <Text fontSize="xs" color="text.muted">
                  over {range} days
                </Text>
              </Stat>
            </SectionCard>
            <SectionCard>
              <Stat>
                <StatLabel color="text.muted">Active days</StatLabel>
                <StatNumber>{totals.activeDays}</StatNumber>
                <Text fontSize="xs" color="text.muted">
                  of the last {range}
                </Text>
              </Stat>
            </SectionCard>
          </SimpleGrid>

          <SectionCard
            title="Activity"
            subtitle="The last 13 weeks — darker means more worship recorded"
            icon={FiAward}
          >
            <Box overflowX="auto" pb={2}>
              <Flex gap={2} minW="fit-content">
                <Grid
                  templateRows="repeat(7, 14px)"
                  gap="3px"
                  fontSize="2xs"
                  color="text.muted"
                  pr={1}
                >
                  {weekdayLabels.map((label, index) => (
                    <Text key={label} gridRow={index + 1} lineHeight="14px">
                      {index % 2 === 1 ? label : ''}
                    </Text>
                  ))}
                </Grid>
                <Grid templateRows="repeat(7, 14px)" autoFlow="column" gap="3px">
                  {Array.from({ length: leadingBlanks }, (_, index) => (
                    <Box key={`blank-${index}`} boxSize="14px" />
                  ))}
                  {heatmap.map((cell) => (
                    <Tooltip
                      key={cell.date}
                      label={`${describeDateKey(cell.date)} · ${cell.summary.prayersCompleted}/5 prayers${
                        cell.summary.quranPages ? `, ${cell.summary.quranPages} pages` : ''
                      }${cell.summary.dhikrCount ? `, ${cell.summary.dhikrCount} dhikr` : ''}`}
                      hasArrow
                      openDelay={200}
                    >
                      <Box
                        as="button"
                        type="button"
                        onClick={() => setSelected(cell.date)}
                        boxSize="14px"
                        borderRadius="3px"
                        bg={LEVEL_COLORS[cell.level]}
                        _dark={{ bg: cell.level === 0 ? 'whiteAlpha.100' : LEVEL_COLORS[cell.level] }}
                        outline={selected === cell.date ? '2px solid' : 'none'}
                        outlineColor="accent.solid"
                        outlineOffset="1px"
                        aria-label={`${cell.date}: ${cell.summary.prayersCompleted} of 5 prayers`}
                      />
                    </Tooltip>
                  ))}
                </Grid>
              </Flex>
            </Box>
            <HStack spacing={2} mt={3} justify="flex-end">
              <Text fontSize="xs" color="text.muted">
                Less
              </Text>
              {LEVEL_COLORS.map((color, index) => (
                <Box
                  key={color}
                  boxSize="12px"
                  borderRadius="3px"
                  bg={color}
                  _dark={{ bg: index === 0 ? 'whiteAlpha.100' : color }}
                />
              ))}
              <Text fontSize="xs" color="text.muted">
                More
              </Text>
            </HStack>
          </SectionCard>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 5 }}>
            {METRICS.map((metric) => (
              <SectionCard key={metric.key} title={metric.label} icon={FiTrendingUp}>
                <TrendChart
                  series={buildSeries(state, metric.key, range)}
                  label={metric.label}
                  type={metric.type}
                  color={metric.color}
                  suggestedMax={metric.key === 'prayers' ? 5 : undefined}
                  height={200}
                />
              </SectionCard>
            ))}
          </SimpleGrid>

          <SectionCard
            title={describeDateKey(selected)}
            subtitle={formatLongDate(fromDateKey(selected))}
            icon={FiCalendar}
          >
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={5}>
              <Stat>
                <StatLabel color="text.muted">
                  <Icon as={FaKaaba} mr={1} boxSize={3} />
                  Prayers
                </StatLabel>
                <StatNumber fontSize="xl">{summary.prayersCompleted}/5</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="text.muted">
                  <Icon as={FiBookOpen} mr={1} boxSize={3} />
                  Pages
                </StatLabel>
                <StatNumber fontSize="xl">{summary.quranPages}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="text.muted">
                  <Icon as={FaRegStar} mr={1} boxSize={3} />
                  Dhikr
                </StatLabel>
                <StatNumber fontSize="xl">{summary.dhikrCount}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="text.muted">
                  <Icon as={LuHeartHandshake} mr={1} boxSize={3} />
                  Du'a
                </StatLabel>
                <StatNumber fontSize="xl">{summary.duaCount}</StatNumber>
              </Stat>
            </SimpleGrid>

            <Flex gap={2} wrap="wrap" mb={4}>
              {PRAYER_KEYS.map((key) => {
                const meta = statusMeta(day.prayers[key]);
                return (
                  <Badge key={key} colorScheme={meta.colorScheme} variant="subtle" px={2} py={1}>
                    {TIME_LABELS[key]} · {meta.label}
                  </Badge>
                );
              })}
            </Flex>

            {day.quran.length > 0 && (
              <Box mb={4}>
                <Text fontSize="sm" fontWeight="700" mb={1}>
                  Qur'an
                </Text>
                <VStack spacing={1} align="stretch">
                  {day.quran.map((entry) => (
                    <Text key={entry.id} fontSize="sm" color="text.secondary">
                      {surahLabel(entry.surah)} · {entry.startAyah}–{entry.endAyah} ({entry.pages} pages)
                    </Text>
                  ))}
                </VStack>
              </Box>
            )}

            {day.notes && (
              <Box p={3} borderRadius="lg" bg="surface.subtle">
                <Text fontSize="sm" fontStyle="italic" color="text.secondary">
                  {day.notes}
                </Text>
              </Box>
            )}
          </SectionCard>
        </VStack>
      )}
    </Box>
  );
};

export default History;
