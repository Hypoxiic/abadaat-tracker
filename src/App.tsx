import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Navigation from './components/Navigation';

// Pages
import Dashboard from './pages/Dashboard';
import PrayerTracker from './pages/PrayerTracker';
import QuranTracker from './pages/QuranTracker';
import DhikrTracker from './pages/DhikrTracker';
import DuaTracker from './pages/DuaTracker';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg={bgColor}>
      <Header />
      <Flex flex="1">
        <Navigation />
        <Box flex="1" p={6} overflowY="auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/prayer" element={<PrayerTracker />} />
            <Route path="/quran" element={<QuranTracker />} />
            <Route path="/dhikr" element={<DhikrTracker />} />
            <Route path="/dua" element={<DuaTracker />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Flex>
      <Footer />
    </Box>
  );
};

export default App; 