import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Text,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiMenu, FiMoon, FiSun } from 'react-icons/fi';
import { FaKaaba } from 'react-icons/fa';
import { formatHijri, formatLongDate, toHijri } from '../../lib/dates';
import { formatCountdown } from '../../lib/prayerTimes';
import { useSettings } from '../../hooks/appState';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';

interface HeaderProps {
  onOpenMenu: () => void;
}

/** Live "next prayer" pill. Kept in the header so it is visible on every page. */
const NextPrayerPill: React.FC = () => {
  const { next } = usePrayerTimes();

  return (
    <HStack
      spacing={2}
      px={3}
      py={1.5}
      borderRadius="full"
      bg="whiteAlpha.200"
      display={{ base: 'none', sm: 'flex' }}
      aria-live="polite"
    >
      <Box boxSize={2} borderRadius="full" bg="gold.300" flexShrink={0} />
      <Text fontSize="sm" fontWeight="600" whiteSpace="nowrap">
        {next.label} in {formatCountdown(next.msUntil)}
      </Text>
    </HStack>
  );
};

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const settings = useSettings();
  const today = new Date();
  const hijri = toHijri(today, settings.hijriOffset);

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex="sticky"
      h="64px"
      bgGradient="linear(to-r, brand.700, brand.600)"
      color="white"
      borderBottomWidth="1px"
      borderColor="brand.800"
    >
      <Flex align="center" h="100%" px={{ base: 3, md: 5 }} gap={3}>
        <IconButton
          aria-label="Open navigation menu"
          icon={<Icon as={FiMenu} boxSize={5} />}
          onClick={onOpenMenu}
          variant="ghost"
          color="white"
          display={{ base: 'inline-flex', lg: 'none' }}
          _hover={{ bg: 'whiteAlpha.300' }}
          _active={{ bg: 'whiteAlpha.400' }}
        />

        <HStack
          as={RouterLink}
          to="/"
          spacing={2.5}
          minW={0}
          _hover={{ textDecoration: 'none' }}
          aria-label="Abadaat Tracker home"
        >
          <Flex
            align="center"
            justify="center"
            boxSize={9}
            borderRadius="lg"
            bg="whiteAlpha.200"
            flexShrink={0}
          >
            <Icon as={FaKaaba} boxSize={4} />
          </Flex>
          <Box minW={0}>
            <Heading as="p" size="sm" letterSpacing="-0.01em" noOfLines={1}>
              Abadaat Tracker
            </Heading>
            <Text
              fontSize="2xs"
              color="whiteAlpha.800"
              noOfLines={1}
              display={{ base: 'none', md: 'block' }}
            >
              {settings.showHijriDate ? formatHijri(hijri) : formatLongDate(today)}
            </Text>
          </Box>
        </HStack>

        <Box flex="1" />

        <NextPrayerPill />

        <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}>
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={<Icon as={colorMode === 'light' ? FiMoon : FiSun} boxSize={5} />}
            onClick={toggleColorMode}
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.300' }}
            _active={{ bg: 'whiteAlpha.400' }}
          />
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default Header;
