import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  HStack, 
  Text, 
  Checkbox, 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  useToast, 
  useColorModeValue,
  Container,
  SimpleGrid,
  Flex,
  Spacer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Skeleton
} from '@chakra-ui/react';
import { format } from 'date-fns';
import PrayerTimesDisplay from '../components/PrayerTimesDisplay';
import { PrayerTimesData } from '../utils/prayerTimes';

interface PrayerData {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

const PrayerTracker: React.FC = () => {
  const [prayers, setPrayers] = useState<PrayerData>({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  });
  
  const [currentPrayerTimes, setCurrentPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const highlightBg = useColorModeValue('green.50', 'green.900');

  useEffect(() => {
    // Load prayer data from localStorage
    const loadPrayerData = () => {
      try {
        setIsLoading(true);
        const today = format(new Date(), 'yyyy-MM-dd');
        const savedData = localStorage.getItem(`prayerData_${today}`);
        
        if (savedData) {
          setPrayers(JSON.parse(savedData));
        } else {
          // Reset prayers for a new day
          const resetData = {
            fajr: false,
            dhuhr: false,
            asr: false,
            maghrib: false,
            isha: false,
          };
          setPrayers(resetData);
          localStorage.setItem(`prayerData_${today}`, JSON.stringify(resetData));
        }
        
        // Load streak data
        const streakData = localStorage.getItem('prayer_streak');
        if (streakData) {
          setStreak(JSON.parse(streakData));
        }
      } catch (error) {
        console.error('Error loading prayer data:', error);
        // Initialize with default values in case of error
        setPrayers({
          fajr: false,
          dhuhr: false,
          asr: false,
          maghrib: false,
          isha: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPrayerData();
    
    // Check if we need to update the streak
    updateStreak();
  }, []);
  
  // Update streak based on yesterday's prayers
  const updateStreak = () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
      
      const yesterdayData = localStorage.getItem(`prayerData_${yesterdayStr}`);
      
      if (yesterdayData) {
        const yesterdayPrayers = JSON.parse(yesterdayData);
        const allCompleted = Object.values(yesterdayPrayers).every(Boolean);
        
        if (allCompleted) {
          // Increment streak
          const newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem('prayer_streak', JSON.stringify(newStreak));
        } else {
          // Reset streak if yesterday's prayers were not all completed
          setStreak(0);
          localStorage.setItem('prayer_streak', JSON.stringify(0));
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const handlePrayerToggle = (prayer: keyof PrayerData) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const updatedPrayers = {
        ...prayers,
        [prayer]: !prayers[prayer],
      };
      
      setPrayers(updatedPrayers);
      localStorage.setItem(`prayerData_${today}`, JSON.stringify(updatedPrayers));
      
      // Update stats in localStorage for Dashboard
      const storedStats = localStorage.getItem('abadaat_stats');
      if (storedStats) {
        const stats = JSON.parse(storedStats);
        const completedCount = Object.values(updatedPrayers).filter(Boolean).length;
        
        stats.prayers = {
          completed: completedCount,
          total: 5
        };
        
        localStorage.setItem('abadaat_stats', JSON.stringify(stats));
      }
      
      if (updatedPrayers[prayer]) {
        toast({
          title: 'Prayer Completed',
          description: `You've marked ${prayer.charAt(0).toUpperCase() + prayer.slice(1)} as completed.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error toggling prayer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update prayer status. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetPrayers = () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const resetData = {
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
      };
      
      setPrayers(resetData);
      localStorage.setItem(`prayerData_${today}`, JSON.stringify(resetData));
      
      // Update stats in localStorage for Dashboard
      const storedStats = localStorage.getItem('abadaat_stats');
      if (storedStats) {
        const stats = JSON.parse(storedStats);
        stats.prayers = {
          completed: 0,
          total: 5
        };
        
        localStorage.setItem('abadaat_stats', JSON.stringify(stats));
      }
      
      toast({
        title: 'Prayers Reset',
        description: 'All prayer statuses have been reset.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error resetting prayers:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset prayer statuses. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle prayer times calculation
  const handlePrayerTimesCalculated = (times: PrayerTimesData) => {
    try {
      setCurrentPrayerTimes(times);
    } catch (error) {
      console.error('Error handling prayer times:', error);
    }
  };

  const prayersList = [
    { id: 'fajr', name: 'Fajr', time: currentPrayerTimes?.fajr || 'Dawn' },
    { id: 'dhuhr', name: 'Dhuhr', time: currentPrayerTimes?.dhuhr || 'Noon' },
    { id: 'asr', name: 'Asr', time: currentPrayerTimes?.asr || 'Afternoon' },
    { id: 'maghrib', name: 'Maghrib', time: currentPrayerTimes?.maghrib || 'Sunset' },
    { id: 'isha', name: 'Isha', time: currentPrayerTimes?.isha || 'Night' },
  ];

  const completedCount = Object.values(prayers).filter(Boolean).length;

  return (
    <Container maxW="container.xl" py={8}>
      <Box textAlign="center" mb={8}>
        <Heading as="h1" size="xl" mb={2} color={headingColor}>Prayer Tracker</Heading>
        <Text fontSize="lg" color={textColor}>
          Track your daily prayers and view accurate prayer times
        </Text>
      </Box>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <VStack spacing={6} align="stretch">
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" boxShadow="md">
            <CardHeader bg="brand.600" color="white">
              <Flex align="center">
                <Heading size="md">Daily Prayers</Heading>
                <Spacer />
                <Text>{completedCount}/5 completed</Text>
              </Flex>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <VStack spacing={4}>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <Skeleton key={index} height="60px" width="100%" />
                  ))}
                </VStack>
              ) : (
                <VStack align="stretch" spacing={4}>
                  {prayersList.map((prayer) => (
                    <HStack 
                      key={prayer.id} 
                      justify="space-between" 
                      p={3} 
                      borderWidth="1px" 
                      borderRadius="md" 
                      borderColor={prayers[prayer.id as keyof PrayerData] ? 'green.300' : borderColor} 
                      bg={prayers[prayer.id as keyof PrayerData] ? highlightBg : 'transparent'}
                      _hover={{ borderColor: 'brand.400', transition: 'all 0.2s' }}
                    >
                      <Box>
                        <Text fontWeight="bold" color={headingColor}>{prayer.name}</Text>
                        <Text fontSize="sm" color={mutedTextColor}>{prayer.time}</Text>
                      </Box>
                      <Checkbox 
                        isChecked={prayers[prayer.id as keyof PrayerData]} 
                        onChange={() => handlePrayerToggle(prayer.id as keyof PrayerData)}
                        colorScheme="green"
                        size="lg"
                      />
                    </HStack>
                  ))}
                </VStack>
              )}
              
              <Button 
                colorScheme="red" 
                variant="outline" 
                mt={6} 
                onClick={resetPrayers}
                size="sm"
                isDisabled={isLoading}
              >
                Reset All Prayers
              </Button>
            </CardBody>
          </Card>
          
          {streak > 0 && (
            <Card bg={cardBg} borderWidth="1px" borderColor="purple.200" borderRadius="lg" boxShadow="md">
              <CardBody>
                <VStack>
                  <Heading size="md" color="purple.500">Prayer Streak: {streak} {streak === 1 ? 'day' : 'days'}</Heading>
                  <Text fontSize="sm" color={textColor} textAlign="center">
                    You've completed all five daily prayers for {streak} consecutive {streak === 1 ? 'day' : 'days'}!
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}
          
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" boxShadow="md">
            <CardHeader bg="blue.500" color="white">
              <Heading size="md">Prayer Tips</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Prayer Times Source</AlertTitle>
                    <AlertDescription color={textColor}>
                      Prayer times are calculated based on sun data from timeanddate.com, which provides accurate astronomical calculations.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Divider />
                
                <Text fontWeight="bold" color={headingColor}>Prayer Time Guidelines:</Text>
                <VStack align="start" spacing={2} pl={4}>
                  <Text fontSize="sm" color={textColor}>• <strong>Fajr:</strong> Begins at nautical twilight and ends at sunrise</Text>
                  <Text fontSize="sm" color={textColor}>• <strong>Dhuhr:</strong> Begins at solar noon and ends when an object's shadow equals its height</Text>
                  <Text fontSize="sm" color={textColor}>• <strong>Asr:</strong> Begins when an object's shadow equals its height and ends at sunset</Text>
                  <Text fontSize="sm" color={textColor}>• <strong>Maghrib:</strong> Begins about 20 minutes after sunset and lasts until twilight ends</Text>
                  <Text fontSize="sm" color={textColor}>• <strong>Isha:</strong> Begins when twilight ends and lasts until midnight</Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
        
        <VStack spacing={6} align="stretch">
          <PrayerTimesDisplay onTimesCalculated={handlePrayerTimesCalculated} />
          
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" boxShadow="md">
            <CardHeader bg="orange.500" color="white">
              <Heading size="md">Prayer Benefits</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Text color={textColor}>
                  Regular prayer has numerous spiritual and physical benefits:
                </Text>
                
                <VStack align="start" spacing={2} pl={4}>
                  <Text fontSize="sm" color={textColor}>• Provides spiritual connection and peace</Text>
                  <Text fontSize="sm" color={textColor}>• Creates structure and discipline in daily life</Text>
                  <Text fontSize="sm" color={textColor}>• Reduces stress and anxiety</Text>
                  <Text fontSize="sm" color={textColor}>• Promotes mindfulness and focus</Text>
                  <Text fontSize="sm" color={textColor}>• Strengthens community bonds</Text>
                </VStack>
                
                <Divider />
                
                <Text fontStyle="italic" fontSize="sm" color={mutedTextColor}>
                  "Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater."
                  <Text as="span" fontWeight="bold" display="block" mt={1} color={textColor}>
                    - Quran 29:45
                  </Text>
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </SimpleGrid>
    </Container>
  );
};

export default PrayerTracker; 