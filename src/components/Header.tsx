import React from 'react';
import { Box, Flex, Heading, IconButton, useColorMode, useColorModeValue, HStack, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { FaMosque } from 'react-icons/fa';

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('brand.500', 'gray.800');
  const textColor = useColorModeValue('white', 'white');
  const borderColor = useColorModeValue('brand.600', 'gray.700');

  return (
    <Box 
      as="header" 
      bg={bgColor} 
      borderBottom="1px" 
      borderColor={borderColor} 
      py={4} 
      px={6} 
      position="sticky" 
      top={0} 
      zIndex={10}
      boxShadow="md"
    >
      <Flex justify="space-between" align="center" maxW="1200px" mx="auto">
        <Flex align="center">
          <Box as={FaMosque} color={textColor} fontSize="2xl" mr={2} />
          <Heading 
            as={RouterLink} 
            to="/" 
            size="lg" 
            color={textColor} 
            _hover={{ textDecoration: 'none', transform: 'scale(1.05)', transition: 'transform 0.2s' }}
            fontFamily='"Noto Sans", "Noto Sans Arabic", sans-serif'
          >
            Abadaat Tracker
          </Heading>
        </Flex>
        
        <HStack spacing={4}>
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="outline"
            size="md"
            color={textColor}
            borderColor={textColor}
            _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header; 