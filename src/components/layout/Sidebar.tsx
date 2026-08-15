import React from 'react';
import { Box, Divider, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS, type NavItem } from './navItems';

interface NavLinkItemProps {
  item: NavItem;
  onNavigate?: () => void;
  showDescription?: boolean;
}

export const NavLinkItem: React.FC<NavLinkItemProps> = ({
  item,
  onNavigate,
  showDescription = false,
}) => (
  <Box
    as={NavLink}
    to={item.path}
    end={item.path === '/'}
    onClick={onNavigate}
    borderRadius="lg"
    px={3}
    py={showDescription ? 3 : 2.5}
    display="block"
    color="text.secondary"
    transition="background 0.15s ease, color 0.15s ease"
    _hover={{ bg: 'surface.subtle', color: 'accent.emphasis' }}
    _activeLink={{
      bg: 'surface.subtle',
      color: 'accent.emphasis',
      fontWeight: '700',
      boxShadow: 'inset 3px 0 0 var(--chakra-colors-brand-500)',
    }}
  >
    <HStack spacing={3} align={showDescription ? 'flex-start' : 'center'}>
      <Icon as={item.icon} boxSize={showDescription ? 5 : 4} mt={showDescription ? 0.5 : 0} />
      <Box minW={0}>
        <Text fontSize="sm" fontWeight="inherit" lineHeight="1.3">
          {item.label}
        </Text>
        {showDescription && (
          <Text fontSize="xs" color="text.muted" mt={0.5} noOfLines={1}>
            {item.description}
          </Text>
        )}
      </Box>
    </HStack>
  </Box>
);

/** Desktop sidebar. Hidden below `lg`, where the drawer and bottom bar take over. */
export const Sidebar: React.FC = () => (
  <Box
    as="nav"
    aria-label="Main"
    display={{ base: 'none', lg: 'block' }}
    w="248px"
    flexShrink={0}
    borderRightWidth="1px"
    borderColor="border.default"
    bg="surface.raised"
    position="sticky"
    top="64px"
    alignSelf="flex-start"
    h="calc(100dvh - 64px)"
    overflowY="auto"
    py={5}
    px={3}
  >
    <Flex direction="column" h="100%">
      <Text
        px={3}
        mb={2}
        fontSize="2xs"
        fontWeight="700"
        letterSpacing="0.1em"
        textTransform="uppercase"
        color="text.muted"
      >
        Track
      </Text>
      <VStack spacing={0.5} align="stretch">
        {NAV_ITEMS.filter((item) => item.primary).map((item) => (
          <NavLinkItem key={item.path} item={item} />
        ))}
      </VStack>

      <Divider my={4} />

      <Text
        px={3}
        mb={2}
        fontSize="2xs"
        fontWeight="700"
        letterSpacing="0.1em"
        textTransform="uppercase"
        color="text.muted"
      >
        Review
      </Text>
      <VStack spacing={0.5} align="stretch">
        {NAV_ITEMS.filter((item) => !item.primary).map((item) => (
          <NavLinkItem key={item.path} item={item} />
        ))}
      </VStack>

      <Box flex="1" />

      <Box
        mt={6}
        p={3}
        borderRadius="lg"
        bg="surface.subtle"
        borderWidth="1px"
        borderColor="border.default"
      >
        <Text fontSize="xs" fontStyle="italic" color="text.secondary" lineHeight="1.6">
          “The most beloved of deeds to Allah are those that are consistent, even if they are
          few.”
        </Text>
      </Box>
    </Flex>
  </Box>
);

export default Sidebar;
