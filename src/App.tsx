import React, { Suspense, lazy, useEffect } from 'react';
import { Box, Center, Flex, Link, Spinner, useDisclosure } from '@chakra-ui/react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import { BottomNav, MobileDrawer } from './components/layout/MobileNav';
import ErrorBoundary from './components/ErrorBoundary';
import { usePrayerNotifications } from './hooks/usePrayerNotifications';
import { NAV_ITEMS } from './components/layout/navItems';

// Route-level code splitting keeps the initial bundle small.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PrayerTracker = lazy(() => import('./pages/PrayerTracker'));
const QuranTracker = lazy(() => import('./pages/QuranTracker'));
const DhikrTracker = lazy(() => import('./pages/DhikrTracker'));
const DuaTracker = lazy(() => import('./pages/DuaTracker'));
const History = lazy(() => import('./pages/History'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

const RouteFallback: React.FC = () => (
  <Center py={24}>
    <Spinner size="lg" color="brand.500" thickness="3px" label="Loading page" />
  </Center>
);

/** Reset scroll and move focus to the page heading on navigation. */
const RouteChangeEffects: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const title = NAV_ITEMS.find((item) => item.path === pathname)?.label;
    document.title = title ? `${title} · Abadaat Tracker` : 'Abadaat Tracker';
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  usePrayerNotifications();

  return (
    <>
      <Link
        href="#main-content"
        position="absolute"
        left="-9999px"
        top={2}
        zIndex="skipLink"
        bg="brand.600"
        color="white"
        px={4}
        py={2}
        borderRadius="md"
        _focus={{ left: 2 }}
      >
        Skip to content
      </Link>

      <Header onOpenMenu={onOpen} />
      <MobileDrawer isOpen={isOpen} onClose={onClose} />
      <RouteChangeEffects />

      <Flex flex="1" align="stretch" minH={0}>
        <Sidebar />
        <Box
          as="main"
          id="main-content"
          tabIndex={-1}
          flex="1"
          minW={0}
          px={{ base: 4, md: 6, xl: 8 }}
          py={{ base: 5, md: 7 }}
          pb={{ base: '88px', lg: 7 }}
        >
          <Box maxW="1200px" mx="auto" w="100%">
            <ErrorBoundary>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/prayer" element={<PrayerTracker />} />
                  <Route path="/quran" element={<QuranTracker />} />
                  <Route path="/dhikr" element={<DhikrTracker />} />
                  <Route path="/dua" element={<DuaTracker />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/index.html" element={<Navigate to="/" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Box>
        </Box>
      </Flex>

      <Box display={{ base: 'none', lg: 'block' }}>
        <Footer />
      </Box>
      <BottomNav />
    </>
  );
};

export default App;
