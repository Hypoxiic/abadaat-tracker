import React, { useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { FaKaaba } from 'react-icons/fa';
import { FiEdit3, FiPieChart } from 'react-icons/fi';
import PageHeader from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/Cards';
import DateNavigator from '../components/DateNavigator';
import PrayerChecklist from '../components/PrayerChecklist';
import { statusMeta } from '../components/prayerStatus';
import PrayerTimesPanel from '../components/PrayerTimesPanel';
import QiblaCompass from '../components/QiblaCompass';
import { useActions, useAppState } from '../hooks/appState';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { fromDateKey, isToday, todayKey } from '../lib/dates';
import { TIME_LABELS, formatTime } from '../lib/prayerTimes';
import {
  computePrayerStreak,
  countCompletedPrayers,
  getDay,
  missedPrayerBreakdown,
  prayerConsistency,
} from '../lib/stats';
import { PRAYER_KEYS, type PrayerKey, type PrayerStatus } from '../lib/types';

const PrayerTracker: React.FC = () => {
  const state = useAppState();
  const actions = useActions();
  const toast = useToast();
  const [dateKey, setDateKey] = useState<string>(todayKey());

  const selectedDate = useMemo(() => fromDateKey(dateKey), [dateKey]);
  const { times, current, location, now } = usePrayerTimes(selectedDate);
  const day = getDay(state, dateKey);
  const completed = countCompletedPrayers(day);
  const streak = useMemo(() => computePrayerStreak(state), [state]);
  const consistency = useMemo(() => prayerConsistency(state, 30), [state]);
  const breakdown = useMemo(() => missedPrayerBreakdown(state, 30), [state]);

  const showingToday = isToday(dateKey);
  const pastMidnight = showingToday && now.getTime() > times.midnight.getTime();

  const handleSetStatus = (prayer: PrayerKey, status: PrayerStatus) => {
    actions.setPrayerStatus(dateKey, prayer, status);
    if (status !== 'none') {
      toast({
        title: `${TIME_LABELS[prayer]} recorded`,
        description: statusMeta(status).hint,
        status: 'success',
        duration: 1800,
        isClosable: true,
        position: 'bottom',
      });
    }
  };

  return (
    <Box>
      <PageHeader
        eyebrow="Salah"
        title="Prayer tracker"
        description="Record each of the five daily prayers and see exactly when their times begin."
        actions={<DateNavigator value={dateKey} onChange={setDateKey} />}
      />

      {pastMidnight && day.prayers.isha === 'none' && (
        <Alert status="warning" borderRadius="xl" mb={4}>
          <AlertIcon />
          <AlertDescription fontSize="sm">
            Islamic midnight has passed ({formatTime(times.midnight, state.settings.timeFormat, location.timeZone)}).
            Isha is now qadha — record it with the “Qadha” option so your history stays accurate.
          </AlertDescription>
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={{ base: 4, md: 5 }}>
        <Box gridColumn={{ lg: 'span 2' }}>
          <VStack spacing={{ base: 4, md: 5 }} align="stretch">
            <SectionCard
              title="Daily prayers"
              subtitle={`${completed} of 5 recorded`}
              icon={FaKaaba}
              action={
                <HStack spacing={1}>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => actions.setAllPrayers(dateKey, 'ontime')}
                    isDisabled={completed === 5}
                  >
                    Mark all
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => actions.setAllPrayers(dateKey, 'none')}
                    isDisabled={completed === 0}
                  >
                    Clear
                  </Button>
                </HStack>
              }
            >
              <Progress
                value={(completed / 5) * 100}
                size="sm"
                mb={4}
                aria-label="Prayers completed today"
              />
              <PrayerChecklist
                prayers={day.prayers}
                times={times}
                timeZone={location.timeZone}
                onSetStatus={handleSetStatus}
                currentPrayer={showingToday ? current : null}
              />
            </SectionCard>

            <SectionCard
              title="Reflection"
              subtitle="A private note for this day"
              icon={FiEdit3}
            >
              <Textarea
                value={day.notes}
                onChange={(event) => actions.setDayNotes(dateKey, event.target.value)}
                placeholder="How was your worship today? What would you like to improve?"
                rows={3}
                resize="vertical"
                aria-label="Notes for this day"
              />
            </SectionCard>

            <SectionCard
              title="Last 30 days"
              subtitle="Which prayers slip most often"
              icon={FiPieChart}
            >
              <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mb={5}>
                <Stat>
                  <StatLabel color="text.muted">Current streak</StatLabel>
                  <StatNumber>{streak} {streak === 1 ? 'day' : 'days'}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="text.muted">Consistency</StatLabel>
                  <StatNumber>{consistency}%</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="text.muted">Prayers kept</StatLabel>
                  <StatNumber>
                    {breakdown.reduce((sum, item) => sum + (item.total - item.missed), 0)}
                  </StatNumber>
                </Stat>
              </SimpleGrid>

              <VStack spacing={3} align="stretch">
                {breakdown.map((item) => {
                  const kept = item.total - item.missed;
                  const percent = item.total ? (kept / item.total) * 100 : 0;
                  return (
                    <Box key={item.prayer}>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm" fontWeight="600">
                          {TIME_LABELS[item.prayer]}
                        </Text>
                        <Text fontSize="sm" color="text.muted" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {kept}/{item.total}
                        </Text>
                      </Flex>
                      <Progress
                        value={percent}
                        size="sm"
                        colorScheme={percent >= 80 ? 'brand' : percent >= 50 ? 'yellow' : 'red'}
                        aria-label={`${TIME_LABELS[item.prayer]} kept ${Math.round(percent)}% of the time`}
                      />
                    </Box>
                  );
                })}
              </VStack>
            </SectionCard>
          </VStack>
        </Box>

        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <PrayerTimesPanel date={selectedDate} />
          <QiblaCompass />

          <SectionCard title="How this day was prayed" icon={FaKaaba}>
            <VStack spacing={2} align="stretch">
              {PRAYER_KEYS.map((key) => {
                const meta = statusMeta(day.prayers[key]);
                return (
                  <Flex key={key} justify="space-between" align="center">
                    <Text fontSize="sm">{TIME_LABELS[key]}</Text>
                    <Badge colorScheme={meta.colorScheme} variant="subtle">
                      {meta.label}
                    </Badge>
                  </Flex>
                );
              })}
            </VStack>
          </SectionCard>
        </VStack>
      </SimpleGrid>
    </Box>
  );
};

export default PrayerTracker;
