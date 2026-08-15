import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, HStack, Stat, StatLabel, StatNumber, Text, VStack } from '@chakra-ui/react';
import { FaKaaba } from 'react-icons/fa';
import { FiCompass } from 'react-icons/fi';
import { SectionCard } from './ui/Cards';
import { bearingToCompass, getDistanceToKaaba, getQiblaDirection } from '../lib/prayerTimes';
import { resolveLocation } from '../data/locations';
import { useSettings } from '../hooks/appState';

interface OrientationEventLike extends Event {
  alpha?: number | null;
  webkitCompassHeading?: number;
}

/**
 * Qibla finder — listed as a "future" feature in the original README.
 *
 * Always shows the true bearing for the selected location. On devices that
 * expose a compass, the dial also rotates to point at the Kaaba live.
 */
export const QiblaCompass: React.FC = () => {
  const settings = useSettings();
  const location = resolveLocation(settings.locationId, settings.customLocation);
  const qibla = getQiblaDirection(location.latitude, location.longitude);
  const distance = getDistanceToKaaba(location.latitude, location.longitude);

  const [heading, setHeading] = useState<number | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return undefined;

    const requestFn = (
      window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<PermissionState>;
      }
    ).requestPermission;

    if (typeof requestFn === 'function') {
      // iOS requires an explicit user gesture before delivering events.
      setNeedsPermission(true);
      return undefined;
    }

    const handler = (event: Event) => {
      const orientation = event as OrientationEventLike;
      const value =
        typeof orientation.webkitCompassHeading === 'number'
          ? orientation.webkitCompassHeading
          : typeof orientation.alpha === 'number'
            ? 360 - orientation.alpha
            : null;
      if (value !== null && Number.isFinite(value)) setHeading(value);
    };

    window.addEventListener('deviceorientationabsolute', handler, true);
    window.addEventListener('deviceorientation', handler, true);
    return () => {
      window.removeEventListener('deviceorientationabsolute', handler, true);
      window.removeEventListener('deviceorientation', handler, true);
    };
  }, []);

  const enableCompass = async () => {
    const requestFn = (
      window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<PermissionState>;
      }
    ).requestPermission;
    try {
      const result = await requestFn?.();
      if (result === 'granted') {
        setNeedsPermission(false);
        window.addEventListener(
          'deviceorientation',
          (event) => {
            const orientation = event as OrientationEventLike;
            const value =
              typeof orientation.webkitCompassHeading === 'number'
                ? orientation.webkitCompassHeading
                : typeof orientation.alpha === 'number'
                  ? 360 - orientation.alpha
                  : null;
            if (value !== null && Number.isFinite(value)) setHeading(value);
          },
          true,
        );
      }
    } catch {
      setNeedsPermission(false);
    }
  };

  // When the compass is live, rotate the needle relative to the device heading.
  const needleRotation = heading === null ? qibla : qibla - heading;

  return (
    <SectionCard title="Qibla direction" icon={FiCompass} subtitle={`From ${location.name}`}>
      <VStack spacing={4}>
        <Box position="relative" boxSize="180px" role="img" aria-label={`Qibla is ${Math.round(qibla)} degrees from true north`}>
          <Box
            position="absolute"
            inset={0}
            borderRadius="full"
            borderWidth="2px"
            borderColor="border.strong"
            bg="surface.subtle"
          />
          {['N', 'E', 'S', 'W'].map((point, index) => (
            <Text
              key={point}
              position="absolute"
              fontSize="xs"
              fontWeight="700"
              color="text.muted"
              left="50%"
              top="50%"
              transform={`translate(-50%, -50%) rotate(${index * 90}deg) translateY(-76px) rotate(${-index * 90}deg)`}
            >
              {point}
            </Text>
          ))}
          <Flex
            position="absolute"
            inset={0}
            align="center"
            justify="center"
            transform={`rotate(${needleRotation}deg)`}
            transition="transform 0.25s ease-out"
          >
            <Flex direction="column" align="center" transform="translateY(-28px)">
              <Box as={FaKaaba} color="brand.600" fontSize="22px" _dark={{ color: 'brand.300' }} />
              <Box
                w="2px"
                h="58px"
                bgGradient="linear(to-b, brand.500, transparent)"
                borderRadius="full"
              />
            </Flex>
          </Flex>
          <Box
            position="absolute"
            left="50%"
            top="50%"
            transform="translate(-50%, -50%)"
            boxSize={3}
            borderRadius="full"
            bg="brand.600"
          />
        </Box>

        <HStack spacing={8} justify="center">
          <Stat textAlign="center" size="sm">
            <StatLabel color="text.muted">Bearing</StatLabel>
            <StatNumber fontSize="xl">
              {Math.round(qibla)}° {bearingToCompass(qibla)}
            </StatNumber>
          </Stat>
          <Stat textAlign="center" size="sm">
            <StatLabel color="text.muted">Distance</StatLabel>
            <StatNumber fontSize="xl">{distance.toLocaleString()} km</StatNumber>
          </Stat>
        </HStack>

        {needsPermission && (
          <Button size="sm" variant="outline" onClick={enableCompass}>
            Use device compass
          </Button>
        )}

        <Text fontSize="xs" color="text.muted" textAlign="center">
          {heading === null
            ? 'Bearing is measured clockwise from true north. Align with a compass to face the Qibla.'
            : 'Live compass active — hold your device flat and follow the marker.'}
        </Text>
      </VStack>
    </SectionCard>
  );
};

export default QiblaCompass;
