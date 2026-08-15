import React from 'react';
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Consistent page heading. Left-aligned rather than centred so the eye has a
 * single, predictable starting point on every screen.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  eyebrow,
  actions,
}) => (
  <Flex
    as="header"
    direction={{ base: 'column', md: 'row' }}
    align={{ base: 'stretch', md: 'flex-end' }}
    justify="space-between"
    gap={4}
    mb={{ base: 5, md: 7 }}
  >
    <Box minW={0}>
      {eyebrow && (
        <Text
          fontSize="xs"
          fontWeight="700"
          textTransform="uppercase"
          letterSpacing="0.08em"
          color="accent.solid"
          mb={1}
        >
          {eyebrow}
        </Text>
      )}
      <Heading as="h1" size={{ base: 'lg', md: 'xl' }}>
        {title}
      </Heading>
      {description && (
        <Text color="text.secondary" mt={2} maxW="2xl">
          {description}
        </Text>
      )}
    </Box>
    {actions && (
      <Stack direction="row" spacing={2} flexShrink={0} flexWrap="wrap">
        {actions}
      </Stack>
    )}
  </Flex>
);

export default PageHeader;
