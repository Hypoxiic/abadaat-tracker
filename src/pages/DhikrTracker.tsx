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
  IconButton,
  Flex,
  Spacer,
  Badge,
  SimpleGrid,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';

interface DhikrItem {
  id: string;
  name: string;
  count: number;
}

interface DhikrData {
  items: DhikrItem[];
  totalCount: number;
  lastUpdated: string;
}

const DhikrTracker: React.FC = () => {
  const [dhikrData, setDhikrData] = useState<DhikrData>({
    items: [
      { id: '1', name: 'SubhanAllah', count: 0 },
      { id: '2', name: 'Alhamdulillah', count: 0 },
      { id: '3', name: 'Allahu Akbar', count: 0 },
      { id: '4', name: 'Astaghfirullah', count: 0 },
    ],
    totalCount: 0,
    lastUpdated: new Date().toISOString(),
  });

  const [newDhikrName, setNewDhikrName] = useState<string>('');
  
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    // Load dhikr data from localStorage
    const loadDhikrData = () => {
      const savedData = localStorage.getItem('dhikrData');
      if (savedData) {
        setDhikrData(JSON.parse(savedData));
      }
    };

    loadDhikrData();
  }, []);

  const handleIncrement = (id: string) => {
    const updatedItems = dhikrData.items.map(item => 
      item.id === id ? { ...item, count: item.count + 1 } : item
    );
    
    const totalCount = updatedItems.reduce((sum, item) => sum + item.count, 0);
    
    const updatedData = {
      ...dhikrData,
      items: updatedItems,
      totalCount,
      lastUpdated: new Date().toISOString(),
    };
    
    setDhikrData(updatedData);
    localStorage.setItem('dhikrData', JSON.stringify(updatedData));
  };

  const handleDecrement = (id: string) => {
    const updatedItems = dhikrData.items.map(item => 
      item.id === id && item.count > 0 ? { ...item, count: item.count - 1 } : item
    );
    
    const totalCount = updatedItems.reduce((sum, item) => sum + item.count, 0);
    
    const updatedData = {
      ...dhikrData,
      items: updatedItems,
      totalCount,
      lastUpdated: new Date().toISOString(),
    };
    
    setDhikrData(updatedData);
    localStorage.setItem('dhikrData', JSON.stringify(updatedData));
  };

  const handleReset = (id: string) => {
    const updatedItems = dhikrData.items.map(item => 
      item.id === id ? { ...item, count: 0 } : item
    );
    
    const totalCount = updatedItems.reduce((sum, item) => sum + item.count, 0);
    
    const updatedData = {
      ...dhikrData,
      items: updatedItems,
      totalCount,
      lastUpdated: new Date().toISOString(),
    };
    
    setDhikrData(updatedData);
    localStorage.setItem('dhikrData', JSON.stringify(updatedData));
    
    toast({
      title: 'Counter Reset',
      description: 'The dhikr counter has been reset to 0.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleAddNewDhikr = () => {
    if (!newDhikrName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for the dhikr.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const newId = (dhikrData.items.length + 1).toString();
    
    const updatedData = {
      ...dhikrData,
      items: [
        ...dhikrData.items,
        { id: newId, name: newDhikrName, count: 0 }
      ],
      lastUpdated: new Date().toISOString(),
    };
    
    setDhikrData(updatedData);
    localStorage.setItem('dhikrData', JSON.stringify(updatedData));
    setNewDhikrName('');
    
    toast({
      title: 'Dhikr Added',
      description: `"${newDhikrName}" has been added to your dhikr list.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleResetAll = () => {
    const resetItems = dhikrData.items.map(item => ({ ...item, count: 0 }));
    
    const updatedData = {
      ...dhikrData,
      items: resetItems,
      totalCount: 0,
      lastUpdated: new Date().toISOString(),
    };
    
    setDhikrData(updatedData);
    localStorage.setItem('dhikrData', JSON.stringify(updatedData));
    
    toast({
      title: 'All Counters Reset',
      description: 'All dhikr counters have been reset to 0.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Heading mb={6}>Dhikr Tracker</Heading>
      
      <Text fontSize="lg" mb={4}>
        Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </Text>
      
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" mb={6}>
        <CardHeader pb={2}>
          <Heading size="md">Your Dhikr Counters</Heading>
          <Text color="gray.500" fontSize="sm">
            Total count: {dhikrData.totalCount}
          </Text>
        </CardHeader>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            {dhikrData.items.map((item) => (
              <HStack key={item.id} justify="space-between" p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                <Text fontWeight="bold">{item.name}</Text>
                <HStack>
                  <IconButton
                    aria-label="Decrement"
                    icon={<MinusIcon />}
                    size="sm"
                    onClick={() => handleDecrement(item.id)}
                    isDisabled={item.count === 0}
                  />
                  <Text fontWeight="bold" minW="40px" textAlign="center">
                    {item.count}
                  </Text>
                  <IconButton
                    aria-label="Increment"
                    icon={<AddIcon />}
                    size="sm"
                    onClick={() => handleIncrement(item.id)}
                  />
                  <Button size="sm" onClick={() => handleReset(item.id)} ml={2}>
                    Reset
                  </Button>
                </HStack>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
      
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" mb={6}>
        <CardHeader pb={2}>
          <Heading size="md">Add New Dhikr</Heading>
        </CardHeader>
        <CardBody>
          <FormControl>
            <FormLabel>Dhikr Name</FormLabel>
            <HStack>
              <Input 
                value={newDhikrName} 
                onChange={(e) => setNewDhikrName(e.target.value)}
                placeholder="Enter dhikr name"
              />
              <Button colorScheme="green" onClick={handleAddNewDhikr}>
                Add
              </Button>
            </HStack>
          </FormControl>
        </CardBody>
      </Card>
      
      <Button colorScheme="red" variant="outline" onClick={handleResetAll}>
        Reset All Counters
      </Button>
    </Box>
  );
};

export default DhikrTracker; 