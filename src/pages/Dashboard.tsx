import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiAward, FiBookOpen, FiTrendingUp } from 'react-icons/fi';
import { FaKaaba, FaRegStar } from 'react-icons/fa';
import { LuHeartHandshake } from 'react-icons/lu';
import PageHeader from '../components/ui/PageHeader';
import { EmptyState, SectionCard, StatTile } from '../components/ui/Cards';
import PrayerChecklist from '../components/PrayerChecklist';
import PrayerTimesPanel from '../components/PrayerTimesPanel';
import TrendChart from '../components/TrendChart';
import { useActions, useAppState } from '../hooks/appState';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { formatHijri, formatLongDate, todayKey, toHijri } from '../lib/dates';
import {
  buildSeries,
  computeActivityStreak,
  computePrayerStreak,
  getDay,
  prayerConsistency,
  summariseDay,
  totalsForRange,
  type MetricKey,
} from '../lib/stats';
import type { PrayerKey, PrayerStatus } from '../lib/types';

const METRIC_TABS: Array<{
  key: MetricKey;
  label: string;
  color: string;
  type: 'bar' | 'line';
  suggestedMax?: number;
}> = [
  { key: 'prayers', label: 'Prayers', color: '#219e75', type: 'bar', suggestedMax: 5 },
  { key: 'quran', label: "Qur'an", color: '#316dbd', type: 'line' },
  { key: 'dhikr', label: 'Dhikr', color: '#c9992a', type: 'bar' },
  { key: 'dua', label: "Du'a", color: '#874cab', type: 'line' },
];

const greeting = (hour: number): string => {
  if (hour < 5) return 'Peace be with you tonight';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard: React.FC = () => {
  const state = useAppState();
  const actions = useActions();
  const { times, current, location, now } = usePrayerTimes();
  const [range, setRange] = useState<7 | 30>(7);

  const dateKey = todayKey();
  const today = getDay(state, dateKey);
  const summary = useMemo(() => summariseDay(state, dateKey), [state, dateKey]);
  const streak = useMemo(() => computePrayerStreak(state, dateKey), [state, dateKey]);
  const activityStreak = useMemo(() => computeActivityStreak(state, dateKey), [state, dateKey]);
  const consistency = useMemo(() => prayerConsistency(state, 30, dateKey), [state, dateKey]);
  const totals = useMemo(() => totalsForRange(state, range, dateKey), [state, range, dateKey]);
  const seriesByMetric = useMemo(
    () =>
      METRIC_TABS.reduce<Record<MetricKey, ReturnType<typeof buildSeries>>>(
        (acc, tab) => ({ ...acc, [tab.key]: buildSeries(state, tab.key, range, dateKey) }),
        {} as Record<MetricKey, ReturnType<typeof buildSeries>>,
      ),
    [state, range, dateKey],
  );

  const hijri = toHijri(now, state.settings.hijriOffset);
  const goals = state.settings.goals;

  const handleSetStatus = (prayer: PrayerKey, status: PrayerStatus) =>
    actions.setPrayerStatus(dateKey, prayer, status);

  const hasAnyHistory = Object.keys(state.days).length > 0;

  return (
    <Box>
      <PageHeader
        eyebrow={
          state.settings.showHijriDate ? formatHijri(hijri) : formatLongDate(now)
        }
        title={greeting(now.getHours())}
        description={`${formatLongDate(now)} · everything below is recorded on this device.`}
        actions={
          <Button as={RouterLink} to="/prayer" size="sm" leftIcon={<Icon as={FaKaaba} />}>
            Log prayers
          </Button>
        }
      />

      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={{ base: 3, md: 4 }} mb={{ base: 4, md: 6 }}>
        <StatTile
          label="Prayers"
          value={`${summary.prayersCompleted}/5`}
          helpText="Recorded today"
          icon={FaKaaba}
          colorScheme="brand"
          to="/prayer"
          progress={(summary.prayersCompleted / 5) * 100}
        />
        <StatTile
          label="Qur'an"
          value={summary.quranPages ? `${summary.quranPages}` : '0'}
          helpText={goals.quranPages ? `of ${goals.quranPages} page goal` : 'pages today'}
          icon={FiBookOpen}
          colorScheme="lapis"
          to="/quran"
          progress={goals.quranPages ? (summary.quranPages / goals.quranPages) * 100 : undefined}
        />
        <StatTile
          label="Dhikr"
          value={summary.dhikrCount.toLocaleString()}
          helpText={goals.dhikrCount ? `of ${goals.dhikrCount} goal` : 'recitations today'}
          icon={FaRegStar}
          colorScheme="gold"
          to="/dhikr"
          progress={goals.dhikrCount ? (summary.dhikrCount / goals.dhikrCount) * 100 : undefined}
        />
        <StatTile
          label="Du'a"
          value={summary.duaCount.toLocaleString()}
          helpText={goals.duaCount ? `of ${goals.duaCount} goal` : 'recited today'}
          icon={LuHeartHandshake}
          colorScheme="plum"
          to="/dua"
          progress={goals.duaCount ? (summary.duaCount / goals.duaCount) * 100 : undefined}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={{ base: 4, md: 5 }} mb={{ base: 4, md: 5 }}>
        <Box gridColumn={{ lg: 'span 2' }}>
          <SectionCard
            title="Today's prayers"
            subtitle="Tap the circle to record a prayer, or choose how it was prayed"
            icon={FaKaaba}
            action={
              <Button
                size="xs"
                variant="ghost"
                onClick={() => actions.setAllPrayers(dateKey, 'ontime')}
                isDisabled={summary.prayersCompleted === 5}
              >
                Mark all
              </Button>
            }
          >
            <PrayerChecklist
              prayers={today.prayers}
              times={times}
              timeZone={location.timeZone}
              onSetStatus={handleSetStatus}
              currentPrayer={current}
            />
          </SectionCard>
        </Box>

        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <SectionCard title="Consistency" icon={FiAward}>
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Heading size="2xl" color="accent.solid" lineHeight="1">
                  {streak}
                </Heading>
                <Text fontSize="sm" color="text.muted" mt={1}>
                  day prayer streak
                </Text>
              </Box>
              <Box>
                <Heading size="2xl" lineHeight="1">
                  {consistency}%
                </Heading>
                <Text fontSize="sm" color="text.muted" mt={1}>
                  prayers kept, 30 days
                </Text>
              </Box>
            </SimpleGrid>
            <Text fontSize="sm" color="text.secondary" mt={4}>
              {activityStreak > 0
                ? `You have recorded some act of worship ${activityStreak} ${
                    activityStreak === 1 ? 'day' : 'days'
                  } running.`
                : 'Record anything today to begin a streak.'}
            </Text>
            <Button
              as={RouterLink}
              to="/history"
              size="sm"
              variant="outline"
              mt={4}
              w="100%"
              leftIcon={<Icon as={FiTrendingUp} />}
            >
              View history
            </Button>
          </SectionCard>
        </VStack>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={{ base: 4, md: 5 }}>
        <Box gridColumn={{ lg: 'span 2' }}>
          <SectionCard
            title="Trends"
            subtitle={`Last ${range} days · from your own records`}
            icon={FiTrendingUp}
            action={
              <HStack spacing={1}>
                {([7, 30] as const).map((value) => (
                  <Button
                    key={value}
                    size="xs"
                    variant={range === value ? 'solid' : 'ghost'}
                    onClick={() => setRange(value)}
                  >
                    {value}d
                  </Button>
                ))}
              </HStack>
            }
          >
            {hasAnyHistory ? (
              <Tabs variant="soft-rounded" colorScheme="brand" size="sm" isLazy>
                <TabList mb={3} overflowX="auto" py={1}>
                  {METRIC_TABS.map((tab) => (
                    <Tab key={tab.key} whiteSpace="nowrap">
                      {tab.label}
                    </Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {METRIC_TABS.map((tab) => (
                    <TabPanel key={tab.key} px={0} pb={0}>
                      <TrendChart
                        series={seriesByMetric[tab.key]}
                        label={tab.label}
                        type={tab.type}
                        color={tab.color}
                        suggestedMax={tab.suggestedMax}
                      />
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            ) : (
              <EmptyState
                icon={FiTrendingUp}
                title="No history yet"
                description="Charts appear here once you have recorded a day of worship. Nothing is simulated — these are your own numbers."
                action={
                  <Button as={RouterLink} to="/prayer" size="sm">
                    Record today
                  </Button>
                }
              />
            )}

            <Flex gap={6} mt={4} wrap="wrap" borderTopWidth="1px" borderColor="border.default" pt={4}>
              <Stack spacing={0}>
                <Text fontSize="xs" color="text.muted">
                  Prayers kept
                </Text>
                <Text fontWeight="700">
                  {totals.prayersCompleted}/{totals.prayersPossible}
                </Text>
              </Stack>
              <Stack spacing={0}>
                <Text fontSize="xs" color="text.muted">
                  Qur'an pages
                </Text>
                <Text fontWeight="700">{totals.quranPages}</Text>
              </Stack>
              <Stack spacing={0}>
                <Text fontSize="xs" color="text.muted">
                  Dhikr
                </Text>
                <Text fontWeight="700">{totals.dhikrCount.toLocaleString()}</Text>
              </Stack>
              <Stack spacing={0}>
                <Text fontSize="xs" color="text.muted">
                  Complete days
                </Text>
                <Text fontWeight="700">{totals.completeDays}</Text>
              </Stack>
            </Flex>
          </SectionCard>
        </Box>

        <PrayerTimesPanel />
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
