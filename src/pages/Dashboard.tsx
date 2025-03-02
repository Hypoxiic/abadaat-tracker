import React, { useEffect, useState } from 'react';
import { Box, Grid, Heading, Text, Container, Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid, Card, CardHeader, CardBody, Button, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, Divider } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import HistoricalDataChart from '../components/HistoricalDataChart';
import { generateMockPrayerData, generateMockQuranData, generateMockDhikrData, generateMockDuaData } from '../utils/mockData';
import { FaPray, FaBookOpen, FaHeart, FaHandsHelping } from 'react-icons/fa';
import { Alert, AlertDescription, AlertIcon, AlertTitle, VStack } from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface StatsData {
  prayers: { completed: number; total: number };
  quranPages: number;
  dhikrCount: number;
  duaCount: number;
  streak: number;
}

interface HistoricalDataType {
  prayers: { data: number[]; labels: string[] };
  quran: { data: number[]; labels: string[] };
  dhikr: { data: number[]; labels: string[] };
  dua: { data: number[]; labels: string[] };
}

// StatCard component for displaying statistics
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: IconType;
  colorScheme: string;
  linkTo: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon, colorScheme, linkTo }) => {
  const bgColor = `${colorScheme}.500`;
  
  return (
    <Card overflow="hidden" boxShadow="md" _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s ease' }}>
      <CardHeader pb={0} bg={bgColor} color="white">
        <Heading size="md">{title}</Heading>
      </CardHeader>
      <CardBody>
        <Stat>
          <StatNumber fontSize="3xl">{value}</StatNumber>
          <StatHelpText>{description}</StatHelpText>
          <Button as={RouterLink} to={linkTo} size="sm" colorScheme={colorScheme} mt={2}>
            Track {title}
          </Button>
        </Stat>
      </CardBody>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    prayers: { completed: 0, total: 5 },
    quranPages: 0,
    dhikrCount: 0,
    duaCount: 0,
    streak: 0
  });

  const [historicalData, setHistoricalData] = useState<HistoricalDataType>({
    prayers: { data: [], labels: [] },
    quran: { data: [], labels: [] },
    dhikr: { data: [], labels: [] },
    dua: { data: [], labels: [] }
  });

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('brand.700', 'brand.200');
  const statBg = useColorModeValue('brand.50', 'gray.800');

  useEffect(() => {
    // Load stats from localStorage
    const storedStats = localStorage.getItem('abadaat_stats');
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }

    // Generate some sample historical data
    const generateHistoricalData = () => {
      const days = 7;
      const labels = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return format(date, 'dd MMM');
      });

      // Sample prayer data (0-5 prayers per day)
      const prayerData = Array.from({ length: days }, () => 
        Math.floor(Math.random() * 6)
      );

      // Sample Quran pages data (0-20 pages per day)
      const quranData = Array.from({ length: days }, () => 
        Math.floor(Math.random() * 21)
      );

      // Sample dhikr counts (0-100 per day)
      const dhikrData = Array.from({ length: days }, () => 
        Math.floor(Math.random() * 101)
      );

      // Sample dua counts (0-10 per day)
      const duaData = Array.from({ length: days }, () => 
        Math.floor(Math.random() * 11)
      );

      return {
        prayers: { data: prayerData, labels },
        quran: { data: quranData, labels },
        dhikr: { data: dhikrData, labels },
        dua: { data: duaData, labels }
      };
    };

    setHistoricalData(generateHistoricalData());
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <Box textAlign="center" mb={8}>
        <Heading as="h1" size="xl" mb={2}>Dashboard</Heading>
        <Text fontSize="lg" color="gray.600">
          Track your daily acts of worship
        </Text>
        <Text fontSize="md" mt={2}>
          Today is {format(new Date(), 'EEEE, dd MMMM yyyy')}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard 
          title="Prayers" 
          value={`${stats.prayers.completed}/${stats.prayers.total}`} 
          description="Daily prayers completed"
          icon={FaPray}
          colorScheme="brand"
          linkTo="/prayer"
        />
        <StatCard 
          title="Qur'an" 
          value={stats.quranPages.toString()} 
          description="Pages read today"
          icon={FaBookOpen}
          colorScheme="blue"
          linkTo="/quran"
        />
        <StatCard 
          title="Dhikr" 
          value={stats.dhikrCount.toString()} 
          description="Remembrances today"
          icon={FaHeart}
          colorScheme="yellow"
          linkTo="/dhikr"
        />
        <StatCard 
          title="Du'a" 
          value={stats.duaCount.toString()} 
          description="Supplications tracked"
          icon={FaHandsHelping}
          colorScheme="orange"
          linkTo="/dua"
        />
      </SimpleGrid>

      <Card mb={8}>
        <CardHeader bg="purple.500" color="white">
          <Heading size="md">Your Streak</Heading>
        </CardHeader>
        <CardBody textAlign="center">
          <Heading size="4xl" color="purple.500" mb={2}>{stats.streak}</Heading>
          <Text>days of consistent worship</Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Keep it up! Consistency is key to spiritual growth.
          </Text>
        </CardBody>
      </Card>

      <Box mb={8}>
        <Heading as="h2" size="lg" mb={4}>Historical Data</Heading>
        <Tabs colorScheme="brand" isLazy>
          <TabList>
            <Tab>Prayers</Tab>
            <Tab>Qur'an</Tab>
            <Tab>Dhikr</Tab>
            <Tab>Du'a</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <HistoricalDataChart 
                title="Daily Prayers Completed" 
                data={historicalData.prayers.data} 
                labels={historicalData.prayers.labels}
                type="bar"
                color="rgba(76, 175, 80, 1)"
              />
            </TabPanel>
            <TabPanel>
              <HistoricalDataChart 
                title="Qur'an Pages Read" 
                data={historicalData.quran.data} 
                labels={historicalData.quran.labels}
                type="line"
                color="rgba(33, 150, 243, 1)"
              />
            </TabPanel>
            <TabPanel>
              <HistoricalDataChart 
                title="Daily Dhikr Count" 
                data={historicalData.dhikr.data} 
                labels={historicalData.dhikr.labels}
                type="bar"
                color="rgba(255, 193, 7, 1)"
              />
            </TabPanel>
            <TabPanel>
              <HistoricalDataChart 
                title="Daily Du'a Recitations" 
                data={historicalData.dua.data} 
                labels={historicalData.dua.labels}
                type="line"
                color="rgba(255, 87, 34, 1)"
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardHeader bg="brand.500" color="white">
            <Heading size="md">Recent Activity</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Text color="gray.500" textAlign="center">
                Your recent activities will appear here as you track your worship.
              </Text>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader bg="blue.500" color="white">
            <Heading size="md">Tips & Reminders</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>New Feature!</AlertTitle>
                  <AlertDescription>
                    You can now add links to Du'as from Duas.org and other resources in the Du'a tracker.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Prayer Times Added!</AlertTitle>
                  <AlertDescription>
                    Prayer times are now available based on timeanddate.com sun data. Check the Prayer Tracker for accurate prayer times for your location.
                  </AlertDescription>
                </Box>
              </Alert>
              
              <Text>
                "The most beloved of deeds to Allah are those that are consistent, even if they are small."
              </Text>
              <Text fontSize="sm" color="gray.500">
                - Prophet Muhammad (peace be upon him)
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Container>
  );
};

export default Dashboard; 