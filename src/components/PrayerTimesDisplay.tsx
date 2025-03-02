import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  useColorModeValue,
  Flex,
  Spacer,
  Button,
  useToast,
  Tooltip,
  Icon,
  Alert,
  AlertIcon,
  Link,
  Divider
} from '@chakra-ui/react';
import { FaSun, FaMoon, FaClock, FaMapMarkerAlt, FaExternalLinkAlt, FaInfoCircle } from 'react-icons/fa';
import { PrayerTimesData } from '../utils/prayerTimes';
import { getMiltonKeynesPrayerTimes, getTodayDateString, ExtendedPrayerTimesData } from '../utils/miltonKeynesPrayerTimes';
import { format } from 'date-fns';

interface PrayerTimesDisplayProps {
  onTimesCalculated?: (times: PrayerTimesData) => void;
}

const PrayerTimesDisplay: React.FC<PrayerTimesDisplayProps> = ({ onTimesCalculated }) => {
  const [prayerTimes, setPrayerTimes] = useState<ExtendedPrayerTimesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>(format(new Date(), 'h:mm:ss a'));
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const initialRenderRef = useRef(true);
  
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('brand.700', 'brand.200');
  const textColor = useColorModeValue('brand.700', 'brand.200');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  
  // Get prayer times for Milton Keynes
  useEffect(() => {
    const fetchPrayerTimes = () => {
      setLoading(true);
      
      try {
        // Get Milton Keynes prayer times
        const times = getMiltonKeynesPrayerTimes();
        
        setPrayerTimes(times);
        if (onTimesCalculated) {
          onTimesCalculated(times);
        }
        
        // Determine next prayer
        determineNextPrayer(times);
        
        // Only show toast on initial load for Milton Keynes
        if (!initialRenderRef.current) {
          toast({
            title: 'Prayer times updated',
            description: `Showing prayer times for Milton Keynes, UK`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          initialRenderRef.current = false;
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        toast({
          title: 'Error fetching prayer times',
          description: 'Unable to load prayer times for Milton Keynes',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrayerTimes();
  }, []); // Only run once on component mount
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(format(now, 'h:mm:ss a'));
      
      // Re-check next prayer every minute
      if (now.getSeconds() === 0 && prayerTimes) {
        determineNextPrayer(prayerTimes);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [prayerTimes]);
  
  // Determine which prayer is next
  const determineNextPrayer = (times: ExtendedPrayerTimesData) => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Convert prayer times to hours and minutes for comparison
      const timeToMinutes = (timeStr: string) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
        if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      
      const prayers = [
        { name: 'Fajr', time: timeToMinutes(times.fajr) },
        { name: 'Sunrise', time: timeToMinutes(times.sunrise) },
        { name: 'Dhuhr', time: timeToMinutes(times.dhuhr) },
        { name: 'Asr', time: timeToMinutes(times.asr) },
        { name: 'Sunset', time: timeToMinutes(times.sunset) },
        { name: 'Maghrib', time: timeToMinutes(times.maghrib) },
        { name: 'Isha', time: timeToMinutes(times.isha) }
      ];
      
      // Sort prayers by time
      prayers.sort((a, b) => a.time - b.time);
      
      // Find the next prayer
      const next = prayers.find(prayer => prayer.time > currentTimeInMinutes);
      
      if (next) {
        setNextPrayer(next.name);
      } else {
        // If all prayers for today have passed, next prayer is Fajr tomorrow
        setNextPrayer('Fajr (tomorrow)');
      }
    } catch (error) {
      console.error('Error determining next prayer:', error);
      setNextPrayer('Unknown');
    }
  };
  
  // Get prayer time status (upcoming, current, or passed)
  const getPrayerStatus = (prayerTime: string) => {
    if (!prayerTime) return 'unknown';
    
    try {
      const now = new Date();
      const [time, period] = prayerTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      const prayerDate = new Date();
      let prayerHours = hours;
      
      if (period.toLowerCase() === 'pm' && hours !== 12) {
        prayerHours += 12;
      } else if (period.toLowerCase() === 'am' && hours === 12) {
        prayerHours = 0;
      }
      
      prayerDate.setHours(prayerHours, minutes, 0);
      
      // Add 15 minutes to prayer time to consider it "current"
      const prayerEndDate = new Date(prayerDate);
      prayerEndDate.setMinutes(prayerEndDate.getMinutes() + 15);
      
      if (now < prayerDate) {
        return 'upcoming';
      } else if (now >= prayerDate && now <= prayerEndDate) {
        return 'current';
      } else {
        return 'passed';
      }
    } catch (error) {
      console.error('Error getting prayer status:', error);
      return 'unknown';
    }
  };
  
  // Get badge color based on prayer status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return <Badge colorScheme="green">Current</Badge>;
      case 'upcoming':
        return <Badge colorScheme="blue">Upcoming</Badge>;
      case 'passed':
        return <Badge colorScheme="gray">Passed</Badge>;
      default:
        return null;
    }
  };
  
  // Open timeanddate.com in a new tab
  const openTimeAndDate = () => {
    window.open(`https://www.timeanddate.com/sun/uk/milton-keynes`, '_blank');
  };
  
  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" boxShadow="md">
      <CardHeader bg="brand.600" color="white" borderTopRadius="lg">
        <Flex align="center">
          <Heading size="md">Prayer Times</Heading>
          <Spacer />
          <Tooltip label="View on timeanddate.com">
            <Button 
              size="sm" 
              variant="outline" 
              colorScheme="whiteAlpha" 
              leftIcon={<FaExternalLinkAlt />}
              onClick={openTimeAndDate}
            >
              Source
            </Button>
          </Tooltip>
        </Flex>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm" color={textColor}>
              Showing prayer times for Milton Keynes, UK based on astronomical data.
            </Text>
          </Alert>
          
          <Flex align="center" justify="space-between">
            <HStack>
              <Icon as={FaClock} color="brand.500" />
              <Text fontWeight="bold" color={textColor}>{currentTime}</Text>
            </HStack>
            <Text color="brand.600" fontWeight="bold">
              Next: {nextPrayer}
            </Text>
          </Flex>
          
          <Box>
            <HStack mb={2}>
              <Icon as={FaMapMarkerAlt} color="brand.500" />
              <Text fontWeight="bold" color={textColor}>Location:</Text>
              <Text color={textColor}>Milton Keynes, UK</Text>
            </HStack>
            <Text fontSize="sm" color={mutedTextColor}>
              {getTodayDateString()}
            </Text>
          </Box>
          
          {loading ? (
            <Flex justify="center" py={4}>
              <VStack>
                <Spinner color="brand.500" size="lg" />
                <Text color={textColor}>Loading prayer times...</Text>
              </VStack>
            </Flex>
          ) : prayerTimes ? (
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between" p={2} borderWidth="1px" borderRadius="md" borderColor={getPrayerStatus(prayerTimes.fajr) === 'current' ? 'green.300' : borderColor} bg={getPrayerStatus(prayerTimes.fajr) === 'current' ? useColorModeValue('green.50', 'green.900') : 'transparent'}>
                <HStack>
                  <Icon as={FaMoon} color="blue.700" />
                  <Text fontWeight="bold" color={textColor}>Fajr</Text>
                </HStack>
                <HStack>
                  <Text color={textColor}>{prayerTimes.fajr}</Text>
                  {getStatusBadge(getPrayerStatus(prayerTimes.fajr))}
                </HStack>
              </HStack>
              
              <HStack justify="space-between" p={2} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                <HStack>
                  <Icon as={FaSun} color="orange.300" />
                  <Text fontWeight="bold" color={textColor}>Sunrise</Text>
                </HStack>
                <Text color={textColor}>{prayerTimes.sunrise}</Text>
              </HStack>
              
              <HStack justify="space-between" p={2} borderWidth="1px" borderRadius="md" borderColor={getPrayerStatus(prayerTimes.dhuhr) === 'current' ? 'green.300' : borderColor} bg={getPrayerStatus(prayerTimes.dhuhr) === 'current' ? useColorModeValue('green.50', 'green.900') : 'transparent'}>
                <HStack>
                  <Icon as={FaSun} color="orange.500" />
                  <Text fontWeight="bold" color={textColor}>Dhuhr</Text>
                </HStack>
                <HStack>
                  <Text color={textColor}>{prayerTimes.dhuhr}</Text>
                  {getStatusBadge(getPrayerStatus(prayerTimes.dhuhr))}
                </HStack>
              </HStack>
              
              <HStack justify="space-between" p={2} borderWidth="1px" borderRadius="md" borderColor={getPrayerStatus(prayerTimes.asr) === 'current' ? 'green.300' : borderColor} bg={getPrayerStatus(prayerTimes.asr) === 'current' ? useColorModeValue('green.50', 'green.900') : 'transparent'}>
                <HStack>
                  <Icon as={FaSun} color="orange.400" />
                  <Text fontWeight="bold" color={textColor}>Asr</Text>
                </HStack>
                <HStack>
                  <Text color={textColor}>{prayerTimes.asr}</Text>
                  {getStatusBadge(getPrayerStatus(prayerTimes.asr))}
                </HStack>
              </HStack>
              
              <HStack justify="space-between" p={2} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                <HStack>
                  <Icon as={FaSun} color="orange.700" />
                  <Text fontWeight="bold" color={textColor}>Sunset</Text>
                </HStack>
                <Text color={textColor}>{prayerTimes.sunset}</Text>
              </HStack>
              
              <HStack justify="space-between" p={2} borderWidth="1px" borderRadius="md" borderColor={getPrayerStatus(prayerTimes.maghrib) === 'current' ? 'green.300' : borderColor} bg={getPrayerStatus(prayerTimes.maghrib) === 'current' ? useColorModeValue('green.50', 'green.900') : 'transparent'}>
                <HStack>
                  <Icon as={FaSun} color="orange.600" />
                  <Text fontWeight="bold" color={textColor}>Maghrib</Text>
                </HStack>
                <HStack>
                  <Text color={textColor}>{prayerTimes.maghrib}</Text>
                  {getStatusBadge(getPrayerStatus(prayerTimes.maghrib))}
                </HStack>
              </HStack>
              
              <HStack justify="space-between" p={2} borderWidth="1px" borderRadius="md" borderColor={getPrayerStatus(prayerTimes.isha) === 'current' ? 'green.300' : borderColor} bg={getPrayerStatus(prayerTimes.isha) === 'current' ? useColorModeValue('green.50', 'green.900') : 'transparent'}>
                <HStack>
                  <Icon as={FaMoon} color="blue.800" />
                  <Text fontWeight="bold" color={textColor}>Isha</Text>
                </HStack>
                <HStack>
                  <Text color={textColor}>{prayerTimes.isha}</Text>
                  {getStatusBadge(getPrayerStatus(prayerTimes.isha))}
                </HStack>
              </HStack>
              
              <Divider />
              
              <HStack justify="space-between" p={2} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={useColorModeValue('gray.50', 'gray.800')}>
                <HStack>
                  <Icon as={FaMoon} color="purple.500" />
                  <Text fontWeight="bold" color={textColor}>Solar Midnight</Text>
                  <Tooltip label="Isha prayer becomes qadha at solar midnight">
                    <Icon as={FaInfoCircle} color={mutedTextColor} boxSize={3} />
                  </Tooltip>
                </HStack>
                <Text color={textColor}>{prayerTimes.solarMidnight}</Text>
              </HStack>
            </VStack>
          ) : (
            <Text color="red.500">Unable to load prayer times. Please try again later.</Text>
          )}
          
          <Box pt={2} borderTopWidth="1px" borderColor={borderColor}>
            <VStack spacing={1} align="start">
              <Flex align="center">
                <Icon as={FaInfoCircle} color={mutedTextColor} mr={1} />
                <Text fontSize="xs" color={mutedTextColor}>
                  <strong>About Prayer Times:</strong>
                </Text>
              </Flex>
              <Text fontSize="xs" color={mutedTextColor}>
                Prayer times are calculated based on astronomical data for Milton Keynes, UK using the following methods:
              </Text>
              <VStack spacing={0} align="start" pl={4} fontSize="xs" color={mutedTextColor}>
                <Text>• Fajr: Nautical twilight start (sun is 12° below horizon)</Text>
                <Text>• Sunrise: When the sun appears above the horizon</Text>
                <Text>• Dhuhr: Solar noon (when sun reaches highest point)</Text>
                <Text>• Asr: Midpoint between Dhuhr and sunset</Text>
                <Text>• Sunset: When the sun disappears below the horizon</Text>
                <Text>• Maghrib: 20 minutes after sunset</Text>
                <Text>• Isha: Midpoint between sunset and solar midnight</Text>
                <Text>• Solar Midnight: Opposite of solar noon (when Isha becomes qadha)</Text>
              </VStack>
              <Link 
                href="https://www.timeanddate.com/sun/uk/milton-keynes" 
                isExternal 
                fontSize="xs" 
                color="brand.500"
              >
                View detailed sun data for Milton Keynes <Icon as={FaExternalLinkAlt} boxSize={2} />
              </Link>
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default PrayerTimesDisplay; 