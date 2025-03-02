import React from 'react';
import { Box, VStack, Button, useColorModeValue, Divider, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FaHome, FaPray, FaBook, FaHeart, FaHandsHelping, FaCog } from 'react-icons/fa';

const Navigation: React.FC = () => {
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeColor = useColorModeValue('brand.500', 'brand.300');
  const hoverBg = useColorModeValue('brand.50', 'gray.700');

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FaHome /> },
    { name: 'Prayer', path: '/prayer', icon: <FaPray /> },
    { name: 'Qur\'an', path: '/quran', icon: <FaBook /> },
    { name: 'Dhikr', path: '/dhikr', icon: <FaHeart /> },
    { name: 'Du\'a', path: '/dua', icon: <FaHandsHelping /> },
    { name: 'Settings', path: '/settings', icon: <FaCog /> },
  ];

  return (
    <Box 
      as="nav" 
      bg={bgColor} 
      borderRight="1px" 
      borderColor={borderColor} 
      w="240px" 
      h="100%" 
      py={6}
      display={{ base: 'none', md: 'block' }}
      boxShadow="sm"
    >
      <Text 
        fontSize="sm" 
        fontWeight="bold" 
        color="gray.500" 
        px={4} 
        mb={2}
        textTransform="uppercase"
        letterSpacing="wider"
      >
        Main Menu
      </Text>
      
      <VStack spacing={1} align="stretch" px={4}>
        {navItems.map((item) => (
          <Button
            key={item.path}
            as={RouterLink}
            to={item.path}
            variant={location.pathname === item.path ? 'solid' : 'ghost'}
            colorScheme={location.pathname === item.path ? 'brand' : undefined}
            justifyContent="flex-start"
            leftIcon={item.icon}
            size="md"
            w="100%"
            borderRadius="md"
            fontWeight={location.pathname === item.path ? 'bold' : 'medium'}
            color={location.pathname === item.path ? 'white' : undefined}
            _hover={{
              bg: location.pathname === item.path ? undefined : hoverBg,
              transform: 'translateX(3px)',
              transition: 'transform 0.2s'
            }}
            transition="all 0.2s"
          >
            {item.name}
          </Button>
        ))}
      </VStack>
      
      <Divider my={6} borderColor={borderColor} />
      
      <Text 
        fontSize="xs" 
        color="gray.500" 
        px={4} 
        textAlign="center"
        fontStyle="italic"
      >
        "The best of deeds are those that are consistent, even if they are small."
      </Text>
    </Box>
  );
};

export default Navigation; 