import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Button,
  HStack,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Flex,
  Spacer,
  Badge,
  SimpleGrid,
  Divider,
  Checkbox,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  Link,
  InputGroup,
  InputLeftAddon,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { ExternalLinkIcon } from '@chakra-ui/icons';

interface DuaEntry {
  id: string;
  date: string;
  name: string;
  arabicText: string;
  translation: string;
  category: string;
  favourite: boolean;
  completed: boolean;
  notes: string;
  link: string;
}

// Predefined dua categories
const duaCategories = [
  'Morning/Evening',
  'Before/After Meals',
  'Before Sleep',
  'Protection',
  'Forgiveness',
  'Guidance',
  'Family',
  'Health',
  'Success',
  'Other'
];

// Sample duas
const sampleDuas = [
  {
    id: 'morning1',
    name: 'Morning Remembrance',
    arabicText: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَٰهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
    translation: 'We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner.',
    category: 'Morning/Evening',
    link: 'https://duas.org/morningevening.htm',
    favourite: false
  },
  {
    id: 'protection1',
    name: 'Protection from Evil',
    arabicText: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    category: 'Protection',
    link: 'https://duas.org/protection.htm',
    favourite: false
  },
  {
    id: 'forgiveness1',
    name: 'Seeking Forgiveness',
    arabicText: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
    translation: 'My Lord, forgive me and accept my repentance. Indeed, You are the Accepting of repentance, the Merciful.',
    category: 'Forgiveness',
    link: 'https://duas.org/forgiveness.htm',
    favourite: false
  }
];

// Popular Du'a websites
const duaWebsites = [
  { name: 'Duas.org', url: 'https://duas.org/' },
  { name: 'Hisnul Muslim', url: 'https://play.google.com/store/apps/details?id=com.greentech.hisnulmuslim' },
  { name: 'MyDua.org', url: 'https://mydua.org/' },
  { name: 'Sunnah.com', url: 'https://sunnah.com/' }
];

const DuaTracker: React.FC = () => {
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<DuaEntry[]>([]);
  const [stats, setStats] = useState({
    totalDuas: 0,
    completedToday: 0,
    favourites: 0
  });

  // Form state
  const [duaName, setDuaName] = useState('');
  const [arabicText, setArabicText] = useState('');
  const [translation, setTranslation] = useState('');
  const [category, setCategory] = useState(duaCategories[0]);
  const [notes, setNotes] = useState('');
  const [isFavourite, setIsFavourite] = useState(false);
  const [duaLink, setDuaLink] = useState('');
  const [showSampleDuas, setShowSampleDuas] = useState(false);

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('gray.800', 'white');
  const statBg = useColorModeValue('white', 'gray.700');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Load data from localStorage on component mount
  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const storedEntries = localStorage.getItem(`dua_entries_${dateStr}`);
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    } else {
      setEntries([]);
    }
    
    // Load stats
    const storedStats = localStorage.getItem('dua_stats');
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }
  }, [selectedDate]);

  // Save data to localStorage whenever entries change
  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    localStorage.setItem(`dua_entries_${dateStr}`, JSON.stringify(entries));
    
    // Update stats
    const completedCount = entries.filter(entry => entry.completed).length;
    const favouritesCount = entries.filter(entry => entry.favourite).length;
    
    const newStats = {
      ...stats,
      completedToday: completedCount,
      favourites: favouritesCount
    };
    
    setStats(newStats);
    localStorage.setItem('dua_stats', JSON.stringify(newStats));
  }, [entries, selectedDate]);

  const handleAddDua = () => {
    if (!duaName) {
      toast({
        title: "Please enter a du'a name",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    const newEntry: DuaEntry = {
      id: Date.now().toString(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      name: duaName,
      arabicText,
      translation,
      category,
      favourite: isFavourite,
      completed: false,
      notes,
      link: duaLink
    };
    
    setEntries([...entries, newEntry]);
    
    // Reset form
    setDuaName('');
    setArabicText('');
    setTranslation('');
    setCategory(duaCategories[0]);
    setNotes('');
    setIsFavourite(false);
    setDuaLink('');
    
    toast({
      title: "Du'a added",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const daysAgo = parseInt(event.target.value);
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - daysAgo);
    setSelectedDate(newDate);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
    
    toast({
      title: "Du'a removed",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleToggleComplete = (id: string) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, completed: !entry.completed } : entry
    ));
  };

  const handleToggleFavourite = (id: string) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, favourite: !entry.favourite } : entry
    ));
  };

  const handleAddSampleDua = (sample: typeof sampleDuas[0]) => {
    const newEntry: DuaEntry = {
      id: Date.now().toString(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      name: sample.name,
      arabicText: sample.arabicText,
      translation: sample.translation,
      category: sample.category,
      favourite: false,
      completed: false,
      notes: '',
      link: sample.link
    };
    
    setEntries([...entries, newEntry]);
    
    toast({
      title: "Sample du'a added",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box textAlign="center" mb={8}>
        <Heading as="h1" size="xl" mb={2} color={headingColor}>Du'a Tracker</Heading>
        <Text fontSize="lg" color={textColor}>Track your daily supplications to Allah</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <VStack spacing={6} align="stretch">
          <Card>
            <CardHeader bg="orange.500" color="white">
              <Heading size="md">Add New Du'a</Heading>
            </CardHeader>
            <CardBody bg={cardBg}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Du'a Name</FormLabel>
                  <Input 
                    value={duaName}
                    onChange={(e) => setDuaName(e.target.value)}
                    placeholder="Enter the name of the du'a"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Arabic Text</FormLabel>
                  <Textarea 
                    value={arabicText}
                    onChange={(e) => setArabicText(e.target.value)}
                    placeholder="Enter the Arabic text (optional)"
                    dir="rtl"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Translation</FormLabel>
                  <Textarea 
                    value={translation}
                    onChange={(e) => setTranslation(e.target.value)}
                    placeholder="Enter the translation (optional)"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Category</FormLabel>
                  <Select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {duaCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Link to Du'a Resource</FormLabel>
                  <InputGroup>
                    <InputLeftAddon>
                      <ExternalLinkIcon />
                    </InputLeftAddon>
                    <Input 
                      value={duaLink}
                      onChange={(e) => setDuaLink(e.target.value)}
                      placeholder="https://duas.org/..."
                    />
                  </InputGroup>
                  <Text fontSize="xs" color={mutedTextColor} mt={1}>
                    Add a link to Duas.org or another resource for this du'a
                  </Text>
                </FormControl>
                
                <FormControl>
                  <FormLabel color={textColor}>Notes</FormLabel>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any personal notes (optional)"
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <Checkbox 
                    isChecked={isFavourite}
                    onChange={(e) => setIsFavourite(e.target.checked)}
                    colorScheme="orange"
                    mr={2}
                  />
                  <FormLabel mb={0} color={textColor}>Mark as favourite</FormLabel>
                </FormControl>
                
                <Button 
                  colorScheme="orange" 
                  width="full"
                  onClick={handleAddDua}
                >
                  Add Du'a
                </Button>
              </VStack>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader bg="purple.500" color="white">
              <Heading size="md">Du'a Resources</Heading>
            </CardHeader>
            <CardBody bg={cardBg}>
              <VStack spacing={4} align="stretch">
                <Text color={textColor}>Popular websites for finding du'as:</Text>
                
                <SimpleGrid columns={2} spacing={4}>
                  {duaWebsites.map((site) => (
                    <Link 
                      key={site.name} 
                      href={site.url} 
                      isExternal 
                      color="brand.600"
                      p={2}
                      borderRadius="md"
                      _hover={{ bg: "brand.50", textDecoration: "none" }}
                    >
                      <HStack>
                        <ExternalLinkIcon mr={2} />
                        <Text color={textColor}>{site.name}</Text>
                      </HStack>
                    </Link>
                  ))}
                </SimpleGrid>
                
                <Divider />
                
                <Box>
                  <Button
                    colorScheme="purple"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSampleDuas(!showSampleDuas)}
                    mb={2}
                  >
                    {showSampleDuas ? "Hide Sample Du'as" : "Show Sample Du'as"}
                  </Button>
                  
                  {showSampleDuas && (
                    <VStack spacing={3} align="stretch">
                      {sampleDuas.map((dua) => (
                        <Card key={dua.id} size="sm" variant="outline">
                          <CardBody p={3} bg={cardBg}>
                            <VStack align="start" spacing={1}>
                              <Flex width="full" justify="space-between" align="center">
                                <Heading size="xs" color={headingColor}>{dua.name}</Heading>
                                <HStack>
                                  {dua.link && (
                                    <Tooltip label="View on Duas.org">
                                      <Link href={dua.link} isExternal>
                                        <ExternalLinkIcon color="blue.500" />
                                      </Link>
                                    </Tooltip>
                                  )}
                                  <Button 
                                    size="xs" 
                                    colorScheme="purple" 
                                    onClick={() => handleAddSampleDua(dua)}
                                  >
                                    Add
                                  </Button>
                                </HStack>
                              </Flex>
                              <Badge colorScheme="purple">{dua.category}</Badge>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  )}
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
        
        <VStack spacing={6} align="stretch">
          <Card>
            <CardHeader bg="orange.500" color="white">
              <Flex align="center" justify="space-between">
                <Heading size="md">
                  Du'as for {format(selectedDate, 'dd MMMM yyyy')}
                </Heading>
                <Select 
                  width="auto" 
                  size="sm" 
                  bg="white" 
                  color="black"
                  onChange={handleDateChange}
                  defaultValue="0"
                >
                  <option value="0">Today</option>
                  <option value="1">Yesterday</option>
                  <option value="2">2 days ago</option>
                  <option value="3">3 days ago</option>
                  <option value="7">1 week ago</option>
                </Select>
              </Flex>
            </CardHeader>
            <CardBody bg={cardBg}>
              {entries.length === 0 ? (
                <Text textAlign="center" color={mutedTextColor}>
                  No du'as recorded for this day. Add a new du'a to get started.
                </Text>
              ) : (
                <VStack spacing={4} align="stretch">
                  {entries.map((entry) => (
                    <Card key={entry.id} variant="outline">
                      <CardBody bg={cardBg}>
                        <VStack align="start" spacing={3}>
                          <Flex width="full" justify="space-between" align="center">
                            <HStack>
                              <Checkbox 
                                isChecked={entry.completed}
                                onChange={() => handleToggleComplete(entry.id)}
                                colorScheme="green"
                              />
                              <Heading size="sm" textDecoration={entry.completed ? "line-through" : "none"} color={headingColor}>
                                {entry.name}
                              </Heading>
                              {entry.favourite && (
                                <Badge colorScheme="red">Favourite</Badge>
                              )}
                            </HStack>
                            <HStack>
                              {entry.link && (
                                <Tooltip label="Open link">
                                  <Link href={entry.link} isExternal>
                                    <IconButton
                                      aria-label="Open link"
                                      icon={<ExternalLinkIcon />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="blue"
                                    />
                                  </Link>
                                </Tooltip>
                              )}
                              <IconButton
                                aria-label="Delete du'a"
                                icon={<span>🗑️</span>}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteEntry(entry.id)}
                              />
                              <IconButton
                                aria-label={entry.favourite ? "Remove from favourites" : "Add to favourites"}
                                icon={<span>{entry.favourite ? "❤️" : "🤍"}</span>}
                                size="sm"
                                variant="ghost"
                                colorScheme={entry.favourite ? "red" : "gray"}
                                onClick={() => handleToggleFavourite(entry.id)}
                              />
                            </HStack>
                          </Flex>
                          
                          <Badge colorScheme="orange">{entry.category}</Badge>
                          
                          {entry.arabicText && (
                            <Box 
                              p={2} 
                              bg={useColorModeValue('gray.50', 'gray.800')} 
                              width="full" 
                              borderRadius="md"
                              dir="rtl"
                              fontFamily="'Noto Sans Arabic', sans-serif"
                              fontSize="lg"
                            >
                              {entry.arabicText}
                            </Box>
                          )}
                          
                          {entry.translation && (
                            <Box p={2} bg={useColorModeValue('gray.50', 'gray.800')} width="full" borderRadius="md">
                              <Text fontStyle="italic" color={textColor}>{entry.translation}</Text>
                            </Box>
                          )}
                          
                          {entry.notes && (
                            <Box>
                              <Text fontWeight="bold" fontSize="sm" color={textColor}>Notes:</Text>
                              <Text fontSize="sm" color={textColor}>{entry.notes}</Text>
                            </Box>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel color={textColor}>Total Du'as</StatLabel>
              <StatNumber color={headingColor}>{entries.length}</StatNumber>
              <StatHelpText color={mutedTextColor}>For {format(selectedDate, 'dd MMM')}</StatHelpText>
            </Stat>
            
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel color={textColor}>Completed</StatLabel>
              <StatNumber color={headingColor}>{stats.completedToday}</StatNumber>
              <StatHelpText color={mutedTextColor}>
                {stats.completedToday > 0 && entries.length > 0
                  ? `${Math.round((stats.completedToday / entries.length) * 100)}%`
                  : '0%'}
              </StatHelpText>
            </Stat>
            
            <Stat bg={statBg} p={4} borderRadius="lg" boxShadow="sm">
              <StatLabel color={textColor}>Favourites</StatLabel>
              <StatNumber color={headingColor}>{stats.favourites}</StatNumber>
              <StatHelpText color={mutedTextColor}>Marked with ❤️</StatHelpText>
            </Stat>
          </SimpleGrid>
        </VStack>
      </SimpleGrid>
    </Container>
  );
};

export default DuaTracker; 