import React from 'react';
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS, PRIMARY_NAV_ITEMS } from './navItems';
import { NavLinkItem } from './Sidebar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Full navigation for small screens — previously there was none at all. */
export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => (
  <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
    <DrawerOverlay />
    <DrawerContent bg="surface.raised">
      <DrawerCloseButton mt={1} />
      <DrawerHeader fontFamily="heading" fontSize="lg">
        Abadaat Tracker
      </DrawerHeader>
      <DrawerBody px={3} pb={6}>
        <VStack as="nav" aria-label="Main" spacing={1} align="stretch">
          {NAV_ITEMS.map((item) => (
            <NavLinkItem key={item.path} item={item} onNavigate={onClose} showDescription />
          ))}
        </VStack>
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);

/**
 * Thumb-reachable bottom bar for the five trackers. Sits above the safe-area
 * inset so it clears the iOS home indicator.
 */
export const BottomNav: React.FC = () => (
  <Box
    as="nav"
    aria-label="Primary"
    display={{ base: 'block', lg: 'none' }}
    position="fixed"
    bottom={0}
    left={0}
    right={0}
    zIndex="docked"
    bg="surface.raised"
    borderTopWidth="1px"
    borderColor="border.default"
    pb="env(safe-area-inset-bottom)"
    boxShadow="0 -2px 12px rgba(16, 24, 40, 0.06)"
  >
    <HStack spacing={0} justify="space-around" align="stretch">
      {PRIMARY_NAV_ITEMS.map((item) => (
        <Box
          key={item.path}
          as={NavLink}
          to={item.path}
          end={item.path === '/'}
          flex="1"
          py={2}
          textAlign="center"
          color="text.muted"
          minH="56px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={1}
          _activeLink={{ color: 'accent.emphasis', fontWeight: '700' }}
        >
          <Icon as={item.icon} boxSize={5} aria-hidden />
          <Text fontSize="2xs" lineHeight="1" fontWeight="inherit">
            {item.label}
          </Text>
        </Box>
      ))}
    </HStack>
  </Box>
);
