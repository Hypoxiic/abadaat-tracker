import React from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import { PRAYER_KEYS, type PrayerKey, type PrayerStatus } from '../lib/types';
import { TIME_LABELS, formatTime, type PrayerTimes } from '../lib/prayerTimes';
import { isCompleted } from '../lib/stats';
import { STATUS_OPTIONS, statusMeta } from './prayerStatus';
import { useSettings } from '../hooks/appState';

interface PrayerChecklistProps {
  prayers: Record<PrayerKey, PrayerStatus>;
  times?: PrayerTimes;
  timeZone?: string;
  onSetStatus: (prayer: PrayerKey, status: PrayerStatus) => void;
  /** Highlights the prayer whose window is currently open. */
  currentPrayer?: PrayerKey | null;
  /** Compact rows for the dashboard. */
  size?: 'sm' | 'md';
}

/**
 * The prayer checklist, shared by the dashboard and the prayer tracker.
 *
 * A single tap marks a prayer as prayed on time; the menu records how it was
 * prayed. The old version only stored a boolean, so qadha prayers — the whole
 * reason the app tracks Islamic midnight — could not be distinguished.
 */
export const PrayerChecklist: React.FC<PrayerChecklistProps> = ({
  prayers,
  times,
  timeZone,
  onSetStatus,
  currentPrayer,
  size = 'md',
}) => {
  const settings = useSettings();
  const stackButtons = useBreakpointValue({ base: true, sm: false });

  return (
    <VStack spacing={2} align="stretch">
      {PRAYER_KEYS.map((key) => {
        const status = prayers[key];
        const done = isCompleted(status);
        const meta = statusMeta(status);
        const isCurrent = currentPrayer === key;

        return (
          <Flex
            key={key}
            align="center"
            gap={3}
            px={3}
            py={size === 'sm' ? 2 : 2.5}
            borderWidth="1px"
            borderRadius="xl"
            borderColor={done ? `${meta.colorScheme}.200` : isCurrent ? 'brand.300' : 'border.default'}
            bg={done ? `${meta.colorScheme}.50` : 'transparent'}
            _dark={{
              borderColor: done ? `${meta.colorScheme}.700` : isCurrent ? 'brand.600' : 'border.default',
              bg: done ? 'whiteAlpha.50' : 'transparent',
            }}
            transition="border-color 0.15s ease, background 0.15s ease"
          >
            <Tooltip label={done ? 'Clear this prayer' : 'Mark as prayed on time'} openDelay={400}>
              <Button
                onClick={() => onSetStatus(key, done ? 'none' : 'ontime')}
                aria-label={`${TIME_LABELS[key]}: ${done ? meta.label : 'not recorded'}. ${
                  done ? 'Clear' : 'Mark as prayed on time'
                }`}
                aria-pressed={done}
                variant={done ? 'solid' : 'outline'}
                colorScheme={done ? meta.colorScheme : 'gray'}
                size="sm"
                minW={9}
                h={9}
                px={0}
                borderRadius="full"
                flexShrink={0}
              >
                <Icon as={FiCheck} boxSize={4} opacity={done ? 1 : 0.35} />
              </Button>
            </Tooltip>

            <Box minW={0} flex="1">
              <HStack spacing={2}>
                <Text fontWeight="600" fontSize={size === 'sm' ? 'sm' : 'md'}>
                  {TIME_LABELS[key]}
                </Text>
                {isCurrent && (
                  <Badge colorScheme="brand" fontSize="2xs">
                    Now
                  </Badge>
                )}
              </HStack>
              {times && (
                <Text fontSize="xs" color="text.muted" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(times[key], settings.timeFormat, timeZone)}
                </Text>
              )}
            </Box>

            <Menu placement="bottom-end">
              <MenuButton
                as={Button}
                size="xs"
                variant="ghost"
                rightIcon={<Icon as={FiChevronDown} />}
                aria-label={`Change how ${TIME_LABELS[key]} was prayed`}
                color={done ? `${meta.colorScheme}.700` : 'text.muted'}
                _dark={{ color: done ? `${meta.colorScheme}.200` : 'text.muted' }}
              >
                {stackButtons && !done ? 'Log' : meta.label}
              </MenuButton>
              <MenuList minW="180px">
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem
                    key={option.value}
                    onClick={() => onSetStatus(key, option.value)}
                    fontWeight={status === option.value ? '700' : '400'}
                  >
                    <HStack justify="space-between" w="100%">
                      <Text fontSize="sm">{option.label}</Text>
                      {status === option.value && <Icon as={FiCheck} boxSize={3.5} />}
                    </HStack>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Flex>
        );
      })}
    </VStack>
  );
};

export default PrayerChecklist;
