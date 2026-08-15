import React from 'react';
import { Box, Flex, HStack, Icon, Link, Text } from '@chakra-ui/react';
import { FiExternalLink } from 'react-icons/fi';

export const Footer: React.FC = () => (
  <Box
    as="footer"
    borderTopWidth="1px"
    borderColor="border.default"
    bg="surface.raised"
    py={5}
    px={{ base: 4, md: 6 }}
    mt="auto"
  >
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align="center"
      justify="space-between"
      gap={3}
      maxW="1400px"
      mx="auto"
    >
      <Text fontSize="sm" color="text.muted">
        © {new Date().getFullYear()} Abadaat Tracker · Your data stays on this device
      </Text>
      <HStack spacing={4}>
        <Link
          href="https://www.al-islam.org/"
          isExternal
          fontSize="sm"
          color="text.muted"
          _hover={{ color: 'accent.solid' }}
        >
          Al-Islam.org <Icon as={FiExternalLink} boxSize={3} verticalAlign="baseline" />
        </Link>
        <Link
          href="https://www.duas.org/"
          isExternal
          fontSize="sm"
          color="text.muted"
          _hover={{ color: 'accent.solid' }}
        >
          Duas.org <Icon as={FiExternalLink} boxSize={3} verticalAlign="baseline" />
        </Link>
      </HStack>
    </Flex>
  </Box>
);

export default Footer;
