import React from 'react';
import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  Progress,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { FiClock, FiMapPin, FiMoon, FiSunrise, FiSunset } from 'react-icons/fi';
import { SectionCard } from './ui/Cards';
import {
  CALCULATION_METHODS,
  TIME_LABELS,
  formatCountdown,
  formatTime,
  type TimeKey,
} from '../lib/prayerTimes';
import { useSettings } from '../hooks/appState';
import { usePrayerTimes } from '../hooks/usePrayerTimes';

const ROWS: Array<{ key: TimeKey; secondary?: boolean }> = [
  { key: 'fajr' },
  { key: 'sunrise', secondary: true },
  { key: 'dhuhr' },
  { key: 'asr' },
  { key: 'maghrib' },
  { key: 'isha' },
  { key: 'midnight', secondary: true },
];

const SECONDARY_ICONS: Partial<Record<TimeKey, typeof FiSunrise>> = {
  sunrise: FiSunrise,
  sunset: FiSunset,
  midnight: FiMoon,
};

interface PrayerTimesPanelProps {
  /** Optional date to show times for. Defaults to today. */
  date?: Date;
}

/**
 * Prayer times for the configured location, computed from solar position.
 *
 * This replaces a component that displayed hard-coded times for a handful of
 * cities and, for Milton Keynes, a single hard-coded day in March 2025.
 */
export const PrayerTimesPanel: React.FC<PrayerTimesPanelProps> = ({ date }) => {
  const settings = useSettings();
  const { times, next, current, location, now } = usePrayerTimes(date);
  const method = CALCULATION_METHODS[settings.method];
  const showLive = !date || date.toDateString() === now.toDateString();

  // How far through the current prayer window we are.
  const windowProgress = (() => {
    if (!showLive) return null;
    const startKey = current ?? 'midnight';
    const start = times[startKey as TimeKey]?.getTime();
    const end = next.at.getTime();
    if (!start || end <= start) return null;
    return Math.min(100, Math.max(0, ((now.getTime() - start) / (end - start)) * 100));
  })();

  return (
    <SectionCard
      title="Prayer times"
      subtitle={`${location.name}, ${location.country}`}
      icon={FiClock}
      action={
        <Tooltip label={method.description} hasArrow>
          <Badge colorScheme="brand" variant="subtle" cursor="help">
            {settings.method === 'jafari' ? "Ja'fari" : method.name.split(',')[0]}
          </Badge>
        </Tooltip>
      }
      bodyProps={{ pt: 3 }}
    >
      {showLive && (
        <Box
          mb={4}
          p={4}
          borderRadius="xl"
          bgGradient="linear(to-br, brand.600, brand.700)"
          color="white"
        >
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" opacity={0.85}>
            Next prayer
          </Text>
          <Flex align="baseline" justify="space-between" gap={3} mt={1} wrap="wrap">
            <Text fontSize="2xl" fontWeight="700" lineHeight="1.1">
              {next.label}
            </Text>
            <Text fontSize="xl" fontWeight="700" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(next.at, settings.timeFormat, location.timeZone)}
            </Text>
          </Flex>
          <Text fontSize="sm" opacity={0.9} mt={1} aria-live="polite">
            in {formatCountdown(next.msUntil)}
          </Text>
          {windowProgress !== null && (
            <Progress
              value={windowProgress}
              size="xs"
              mt={3}
              colorScheme="gold"
              bg="whiteAlpha.300"
              aria-label="Progress through the current prayer window"
            />
          )}
        </Box>
      )}

      <VStack spacing={0} align="stretch" divider={<Box borderTopWidth="1px" borderColor="border.default" />}>
        {ROWS.map(({ key, secondary }) => {
          const at = times[key];
          const isCurrent = showLive && current === key;
          const isNext = showLive && next.key === key;
          const isPast = showLive && at.getTime() < now.getTime();
          const SecondaryIcon = SECONDARY_ICONS[key];

          return (
            <Flex
              key={key}
              align="center"
              justify="space-between"
              py={2.5}
              px={2}
              mx={-2}
              borderRadius="md"
              bg={isCurrent ? 'surface.subtle' : 'transparent'}
              opacity={isPast && !isCurrent && !secondary ? 0.55 : 1}
              transition="background 0.2s ease"
            >
              <HStack spacing={2.5} minW={0}>
                {SecondaryIcon && <Icon as={SecondaryIcon} color="text.muted" boxSize={3.5} />}
                <Text
                  fontSize={secondary ? 'sm' : 'md'}
                  fontWeight={isCurrent ? '700' : secondary ? '400' : '600'}
                  color={secondary ? 'text.muted' : 'text.primary'}
                >
                  {TIME_LABELS[key]}
                </Text>
                {isCurrent && (
                  <Badge colorScheme="brand" fontSize="2xs">
                    Now
                  </Badge>
                )}
                {isNext && !isCurrent && (
                  <Badge colorScheme="gold" fontSize="2xs">
                    Next
                  </Badge>
                )}
              </HStack>
              <Text
                fontSize={secondary ? 'sm' : 'md'}
                fontWeight={isCurrent ? '700' : '600'}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
                color={secondary ? 'text.muted' : 'text.primary'}
              >
                {formatTime(at, settings.timeFormat, location.timeZone)}
              </Text>
            </Flex>
          );
        })}
      </VStack>

      <HStack spacing={1.5} mt={4} color="text.muted">
        <Icon as={FiMapPin} boxSize={3} />
        <Text fontSize="xs">
          {location.latitude.toFixed(3)}°, {location.longitude.toFixed(3)}° · {location.timeZone}
        </Text>
      </HStack>
      <Text fontSize="xs" color="text.muted" mt={1}>
        Isha becomes qadha at Islamic midnight (
        {formatTime(times.midnight, settings.timeFormat, location.timeZone)}).
      </Text>
    </SectionCard>
  );
};

export default PrayerTimesPanel;
