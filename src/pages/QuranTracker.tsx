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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Progress,
  Divider,
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react';
import { format, subDays } from 'date-fns';

interface ReadingEntry {
  id: string;
  date: string;
  surah: number;
  startVerse: number;
  endVerse: number;
  pages: number;
  notes: string;
}

interface QuranData {
  pagesRead: number;
  totalPages: number;
  lastUpdated: string;
  dailyGoal: number;
}

const QuranTracker: React.FC = () => {
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<ReadingEntry[]>([]);
  const [stats, setStats] = useState({
    totalPages: 0,
    streak: 0,
    pagesThisWeek: 0,
    completions: 0
  });

  // Form state
  const [surah, setSurah] = useState<number>(1);
  const [startVerse, setStartVerse] = useState<number>(1);
  const [endVerse, setEndVerse] = useState<number>(7);
  const [pages, setPages] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  const [quranData, setQuranData] = useState<QuranData>({
    pagesRead: 0,
    totalPages: 604, // Standard Quran has 604 pages
    lastUpdated: new Date().toISOString(),
    dailyGoal: 4,
  });

  const [pagesToAdd, setPagesToAdd] = useState<number>(1);
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Load data from localStorage on component mount
  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const storedEntries = localStorage.getItem(`quran_entries_${dateStr}`);
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    } else {
      setEntries([]);
    }
    
    // Load stats
    const storedStats = localStorage.getItem('quran_stats');
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }

    // Load Quran data from localStorage
    const loadQuranData = () => {
      const savedData = localStorage.getItem('quranData');
      if (savedData) {
        setQuranData(JSON.parse(savedData));
      }
    };

    loadQuranData();
  }, [selectedDate]);

  // Save data to localStorage whenever entries change
  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    localStorage.setItem(`quran_entries_${dateStr}`, JSON.stringify(entries));
    
    // Update stats
    if (entries.length > 0) {
      const totalPagesRead = entries.reduce((sum, entry) => sum + entry.pages, 0);
      
      // Calculate pages read in the last 7 days
      let pagesThisWeek = 0;
      for (let i = 0; i < 7; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const dailyEntries = localStorage.getItem(`quran_entries_${date}`);
        if (dailyEntries) {
          const parsed = JSON.parse(dailyEntries);
          pagesThisWeek += parsed.reduce((sum: number, entry: ReadingEntry) => sum + entry.pages, 0);
        }
      }
      
      const newStats = {
        ...stats,
        totalPages: stats.totalPages + totalPagesRead,
        pagesThisWeek,
      };
      
      setStats(newStats);
      localStorage.setItem('quran_stats', JSON.stringify(newStats));
    }
  }, [entries, selectedDate]);

  const handleAddEntry = () => {
    const newEntry: ReadingEntry = {
      id: Date.now().toString(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      surah,
      startVerse,
      endVerse,
      pages,
      notes
    };
    
    setEntries([...entries, newEntry]);
    
    // Reset form
    setSurah(1);
    setStartVerse(1);
    setEndVerse(7);
    setPages(1);
    setNotes('');
    
    toast({
      title: "Reading entry added",
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
      title: "Entry deleted",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  // Generate array of Surahs for the dropdown
  const surahs = Array.from({ length: 114 }, (_, i) => i + 1);

  const handleAddPages = () => {
    const newPagesRead = Math.min(quranData.pagesRead + pagesToAdd, quranData.totalPages);
    
    const updatedData = {
      ...quranData,
      pagesRead: newPagesRead,
      lastUpdated: new Date().toISOString(),
    };
    
    setQuranData(updatedData);
    localStorage.setItem('quranData', JSON.stringify(updatedData));
    
    toast({
      title: 'Progress Updated',
      description: `You've added ${pagesToAdd} page(s) to your Qur'an reading progress.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleResetProgress = () => {
    const resetData = {
      ...quranData,
      pagesRead: 0,
      lastUpdated: new Date().toISOString(),
    };
    
    setQuranData(resetData);
    localStorage.setItem('quranData', JSON.stringify(resetData));
    
    toast({
      title: 'Progress Reset',
      description: 'Your Qur\'an reading progress has been reset to 0.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUpdateGoal = (value: number) => {
    const updatedData = {
      ...quranData,
      dailyGoal: value,
    };
    
    setQuranData(updatedData);
    localStorage.setItem('quranData', JSON.stringify(updatedData));
  };

  const progressPercentage = (quranData.pagesRead / quranData.totalPages) * 100;

  return (
    <Container maxW="container.xl" py={8}>
      <Box textAlign="center" mb={8}>
        <Heading as="h1" size="xl" mb={2}>Qur'an Reading Tracker</Heading>
        <Text fontSize="lg" color="gray.600">Track your daily Qur'an recitation</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <VStack spacing={6} align="stretch">
          <Card>
            <CardHeader bg="green.500" color="white">
              <Heading size="md">Add New Reading Entry</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Select value={(new Date().getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)} onChange={handleDateChange}>
                    <option value={0}>Today</option>
                    <option value={1}>Yesterday</option>
                    <option value={2}>2 days ago</option>
                    <option value={3}>3 days ago</option>
                    <option value={4}>4 days ago</option>
                    <option value={5}>5 days ago</option>
                    <option value={6}>6 days ago</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Surah</FormLabel>
                  <Select value={surah} onChange={(e) => setSurah(parseInt(e.target.value))}>
                    {surahs.map(num => (
                      <option key={num} value={num}>
                        {num}. Surah {num}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <HStack>
                  <FormControl>
                    <FormLabel>Start Verse</FormLabel>
                    <NumberInput min={1} value={startVerse} onChange={(_, val) => setStartVerse(val)}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>End Verse</FormLabel>
                    <NumberInput min={startVerse} value={endVerse} onChange={(_, val) => setEndVerse(val)}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                
                <FormControl>
                  <FormLabel>Pages Read</FormLabel>
                  <NumberInput min={1} max={604} value={pages} onChange={(_, val) => setPages(val)}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes about your reading" />
                </FormControl>
                
                <Button colorScheme="green" onClick={handleAddEntry} width="full">
                  Add Entry
                </Button>
              </VStack>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader bg="blue.500" color="white">
              <Heading size="md">Your Progress</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Stat>
                  <StatLabel>Total Pages Read</StatLabel>
                  <StatNumber>{quranData.pagesRead} / {quranData.totalPages}</StatNumber>
                </Stat>
                
                <Box>
                  <Text mb={1}>Progress through Qur'an</Text>
                  <Progress value={progressPercentage} colorScheme="green" rounded="md" />
                  <Text mt={1} fontSize="sm" textAlign="right">
                    {Math.round(progressPercentage)}%
                  </Text>
                </Box>
                
                <Divider />
                
                <Stat>
                  <StatLabel>Daily Goal</StatLabel>
                  <StatNumber>{quranData.dailyGoal} pages</StatNumber>
                </Stat>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
        
        <VStack spacing={4} align="stretch">
          <Heading size="md">Today's Reading Entries</Heading>
          {entries.length === 0 ? (
            <Card>
              <CardBody>
                <Text color="gray.500" textAlign="center">No entries for {format(selectedDate, 'EEEE, MMMM d, yyyy')}</Text>
              </CardBody>
            </Card>
          ) : (
            entries.map(entry => (
              <Card key={entry.id}>
                <CardHeader bg="gray.50" pb={2}>
                  <HStack justify="space-between">
                    <Heading size="sm">
                      Surah {entry.surah}: Verses {entry.startVerse}-{entry.endVerse}
                    </Heading>
                    <Text>{entry.pages} pages</Text>
                  </HStack>
                </CardHeader>
                <CardBody pt={2}>
                  <VStack align="stretch" spacing={2}>
                    {entry.notes && (
                      <Text fontSize="sm" color="gray.600">{entry.notes}</Text>
                    )}
                    <HStack justify="flex-end">
                      <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleDeleteEntry(entry.id)}>
                        Delete
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))
          )}
        </VStack>
      </SimpleGrid>

      <Card mt={6} bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
        <CardHeader pb={2}>
          <Heading size="md">Qur'an Progress</Heading>
        </CardHeader>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <Box>
              <HStack justify="space-between" mb={1}>
                <Text fontWeight="bold">Pages Read: {quranData.pagesRead} / {quranData.totalPages}</Text>
                <Text>{progressPercentage.toFixed(1)}%</Text>
              </HStack>
              <Progress value={progressPercentage} colorScheme="green" borderRadius="md" size="md" />
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={1}>Daily Goal: {quranData.dailyGoal} pages</Text>
              <FormControl>
                <FormLabel>Update Daily Goal</FormLabel>
                <NumberInput 
                  min={1} 
                  max={30} 
                  value={quranData.dailyGoal} 
                  onChange={(_, value) => handleUpdateGoal(value)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Box>
            
            <Box>
              <FormControl>
                <FormLabel>Add Pages Read</FormLabel>
                <HStack>
                  <NumberInput 
                    min={1} 
                    max={100} 
                    value={pagesToAdd} 
                    onChange={(_, value) => setPagesToAdd(value)}
                    flex="1"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Button colorScheme="green" onClick={handleAddPages}>
                    Add Pages
                  </Button>
                </HStack>
              </FormControl>
            </Box>
          </VStack>
        </CardBody>
      </Card>
      
      <Button colorScheme="red" variant="outline" onClick={handleResetProgress} mt={4} width="full">
        Reset Progress
      </Button>
    </Container>
  );
};

export default QuranTracker; 