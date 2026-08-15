import React from 'react';
import { Button, HStack, Icon, IconButton, Input, Text, VStack } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import {
  describeDateKey,
  formatHijri,
  formatLongDate,
  fromDateKey,
  shiftDateKey,
  todayKey,
  toHijri,
} from '../lib/dates';
import { useSettings } from '../hooks/appState';

interface DateNavigatorProps {
  value: string;
  onChange: (dateKey: string) => void;
  /** Prevents navigating into the future. Defaults to true. */
  disableFuture?: boolean;
}

/**
 * Day picker used by every tracker.
 *
 * The old pages offered a "days ago" dropdown that could only reach the last
 * week, computed the selected option with floating-point arithmetic, and reset
 * itself whenever the component remounted.
 */
export const DateNavigator: React.FC<DateNavigatorProps> = ({
  value,
  onChange,
  disableFuture = true,
}) => {
  const settings = useSettings();
  const today = todayKey();
  const atToday = value >= today;
  const hijri = toHijri(fromDateKey(value), settings.hijriOffset);

  return (
    <HStack spacing={2} align="center">
      <IconButton
        aria-label="Previous day"
        icon={<Icon as={FiChevronLeft} boxSize={5} />}
        size="sm"
        variant="ghost"
        onClick={() => onChange(shiftDateKey(value, -1))}
      />

      <VStack spacing={0} minW={{ base: '150px', sm: '200px' }} textAlign="center">
        <Text fontWeight="700" fontSize="sm" lineHeight="1.2">
          {describeDateKey(value)}
        </Text>
        <Text fontSize="xs" color="text.muted" noOfLines={1}>
          {settings.showHijriDate ? formatHijri(hijri) : formatLongDate(fromDateKey(value))}
        </Text>
      </VStack>

      <IconButton
        aria-label="Next day"
        icon={<Icon as={FiChevronRight} boxSize={5} />}
        size="sm"
        variant="ghost"
        onClick={() => onChange(shiftDateKey(value, 1))}
        isDisabled={disableFuture && atToday}
      />

      <Input
        type="date"
        size="sm"
        value={value}
        max={disableFuture ? today : undefined}
        onChange={(event) => {
          if (event.target.value) onChange(event.target.value);
        }}
        w="150px"
        display={{ base: 'none', md: 'block' }}
        aria-label="Choose a date"
      />

      {!atToday && (
        <Button size="sm" variant="ghost" onClick={() => onChange(today)}>
          Today
        </Button>
      )}
    </HStack>
  );
};

export default DateNavigator;
