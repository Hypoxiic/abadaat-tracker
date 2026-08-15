import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Icon,
  Progress,
  Skeleton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import type { IconType } from 'react-icons';

/* ------------------------------------------------------------------ */
/* SectionCard                                                          */
/* ------------------------------------------------------------------ */

interface SectionCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: IconType;
  action?: React.ReactNode;
  children: React.ReactNode;
  bodyProps?: React.ComponentProps<typeof CardBody>;
}

/**
 * The standard content container. Replaces the old pattern of a saturated
 * coloured `CardHeader` on every card, which produced a very noisy page.
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  icon,
  action,
  children,
  bodyProps,
}) => (
  <Card as="section" boxShadow="soft" h="100%">
    {(title || action) && (
      <Flex
        align="center"
        gap={3}
        px={{ base: 4, md: 5 }}
        pt={{ base: 4, md: 5 }}
        pb={subtitle ? 1 : 0}
      >
        {icon && (
          <Flex
            align="center"
            justify="center"
            boxSize={9}
            borderRadius="lg"
            bg="surface.subtle"
            color="accent.solid"
            flexShrink={0}
          >
            <Icon as={icon} boxSize={4} />
          </Flex>
        )}
        <Box minW={0} flex="1">
          {title && (
            <Heading as="h2" size="sm" noOfLines={1}>
              {title}
            </Heading>
          )}
          {subtitle && (
            <Text fontSize="sm" color="text.muted" mt={0.5}>
              {subtitle}
            </Text>
          )}
        </Box>
        {action}
      </Flex>
    )}
    <CardBody px={{ base: 4, md: 5 }} py={{ base: 4, md: 5 }} {...bodyProps}>
      {children}
    </CardBody>
  </Card>
);

/* ------------------------------------------------------------------ */
/* StatTile                                                            */
/* ------------------------------------------------------------------ */

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  helpText?: React.ReactNode;
  icon: IconType;
  colorScheme?: string;
  to?: string;
  /** 0-100; renders a progress bar when provided. */
  progress?: number;
  isLoading?: boolean;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  helpText,
  icon,
  colorScheme = 'brand',
  to,
  progress,
  isLoading = false,
}) => {
  const content = (
    <CardBody px={5} py={5}>
      <HStack align="flex-start" justify="space-between" spacing={3} mb={3}>
        <Text
          fontSize="xs"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing="0.06em"
          color="text.muted"
        >
          {label}
        </Text>
        <Flex
          align="center"
          justify="center"
          boxSize={9}
          borderRadius="lg"
          bg={`${colorScheme}.50`}
          color={`${colorScheme}.600`}
          _dark={{ bg: 'whiteAlpha.100', color: `${colorScheme}.200` }}
          flexShrink={0}
        >
          <Icon as={icon} boxSize={4} />
        </Flex>
      </HStack>

      <Skeleton isLoaded={!isLoading}>
        <Heading as="p" size="lg" lineHeight="1.1" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Heading>
      </Skeleton>

      {typeof progress === 'number' && (
        <Progress
          value={Math.max(0, Math.min(100, progress))}
          size="sm"
          colorScheme={colorScheme}
          mt={3}
          aria-label={`${label} progress`}
        />
      )}

      {helpText && (
        <Text fontSize="sm" color="text.muted" mt={2}>
          {helpText}
        </Text>
      )}
    </CardBody>
  );

  if (to) {
    return (
      <Card
        as={RouterLink}
        to={to}
        variant="interactive"
        boxShadow="soft"
        aria-label={`${label}. Open tracker.`}
      >
        {content}
      </Card>
    );
  }

  return (
    <Card boxShadow="soft">
      {content}
    </Card>
  );
};

/* ------------------------------------------------------------------ */
/* EmptyState                                                           */
/* ------------------------------------------------------------------ */

interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <VStack spacing={3} py={10} px={4} textAlign="center">
    {icon && (
      <Flex
        align="center"
        justify="center"
        boxSize={12}
        borderRadius="full"
        bg="surface.subtle"
        color="accent.solid"
      >
        <Icon as={icon} boxSize={5} />
      </Flex>
    )}
    <Stack spacing={1}>
      <Heading as="p" size="sm">
        {title}
      </Heading>
      {description && (
        <Text fontSize="sm" color="text.muted" maxW="sm">
          {description}
        </Text>
      )}
    </Stack>
    {action}
  </VStack>
);
