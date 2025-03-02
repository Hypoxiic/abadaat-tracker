import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Switch,
  Select,
  useColorMode,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  HStack,
  Radio,
  RadioGroup,
  Stack
} from '@chakra-ui/react';

const Settings: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [prayerTimesSource, setPrayerTimesSource] = useState('manual');
  const [dataExportFormat, setDataExportFormat] = useState('json');
  const [language, setLanguage] = useState('english');
  
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      // Clear all localStorage data
      localStorage.clear();
      
      toast({
        title: "Data cleared",
        description: "All your tracking data has been deleted.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleExportData = () => {
    // Collect all data from localStorage
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        }
      }
    }
    
    // Create a downloadable file
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `abadaat_tracker_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Data exported",
      description: "Your data has been exported successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      notificationsEnabled,
      prayerTimesSource,
      dataExportFormat,
      language
    };
    
    localStorage.setItem('app_settings', JSON.stringify(settings));
    
    toast({
      title: "Settings saved",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Box textAlign="center" mb={8}>
        <Heading as="h1" size="xl" mb={2}>Settings</Heading>
        <Text fontSize="lg" color="gray.600">Customize your Abadaat Tracker experience</Text>
      </Box>
      
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader bg="blue.500" color="white">
            <Heading size="md">Appearance</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel htmlFor="color-mode" mb="0">
                  Dark Mode
                </FormLabel>
                <Switch 
                  id="color-mode" 
                  isChecked={colorMode === 'dark'} 
                  onChange={toggleColorMode} 
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Language</FormLabel>
                <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="english">English</option>
                  <option value="arabic">Arabic</option>
                  <option value="urdu">Urdu</option>
                  <option value="turkish">Turkish</option>
                  <option value="indonesian">Indonesian</option>
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader bg="green.500" color="white">
            <Heading size="md">Prayer Times</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Prayer Times Source</FormLabel>
                <RadioGroup value={prayerTimesSource} onChange={setPrayerTimesSource}>
                  <Stack direction="column">
                    <Radio value="manual">Manual Entry</Radio>
                    <Radio value="calculation">Calculate Based on Location</Radio>
                    <Radio value="api">Use Prayer Times API (Coming Soon)</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
              
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Coming Soon!</AlertTitle>
                  <AlertDescription>
                    Automatic prayer times calculation based on your location will be available in a future update.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader bg="purple.500" color="white">
            <Heading size="md">Notifications</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel htmlFor="notifications" mb="0">
                  Enable Notifications
                </FormLabel>
                <Switch 
                  id="notifications" 
                  isChecked={notificationsEnabled} 
                  onChange={(e) => setNotificationsEnabled(e.target.checked)} 
                />
              </FormControl>
              
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Browser Support Required</AlertTitle>
                  <AlertDescription>
                    Notifications require browser permission and may not work on all devices.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader bg="orange.500" color="white">
            <Heading size="md">Data Management</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Export Format</FormLabel>
                <Select value={dataExportFormat} onChange={(e) => setDataExportFormat(e.target.value)}>
                  <option value="json">JSON</option>
                  <option value="csv">CSV (Coming Soon)</option>
                </Select>
              </FormControl>
              
              <HStack spacing={4}>
                <Button colorScheme="blue" onClick={handleExportData} flex="1">
                  Export Data
                </Button>
                <Button colorScheme="red" variant="outline" onClick={handleClearData} flex="1">
                  Clear All Data
                </Button>
              </HStack>
              
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Warning!</AlertTitle>
                  <AlertDescription>
                    Clearing data will remove all your tracking history and cannot be undone.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
        
        <Divider />
        
        <Box textAlign="center">
          <Button colorScheme="green" size="lg" onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default Settings; 