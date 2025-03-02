import React from 'react';
import { Box, Text, Flex, useColorModeValue, HStack, Link, Icon } from '@chakra-ui/react';
import { FaHeart, FaGithub, FaTwitter } from 'react-icons/fa';

const Footer: React.FC = () => {
  const bgColor = useColorModeValue('brand.600', 'gray.800');
  const borderColor = useColorModeValue('brand.700', 'gray.700');
  const textColor = useColorModeValue('white', 'gray.300');

  return (
    <Box as="footer" bg={bgColor} borderTop="1px" borderColor={borderColor} py={6} px={6} color={textColor}>
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" maxW="1200px" mx="auto">
        <Text fontSize="sm" mb={{ base: 4, md: 0 }}>
          &copy; {new Date().getFullYear()} Abadaat Tracker. All rights reserved.
        </Text>
        
        <Text fontSize="sm" textAlign={{ base: 'center', md: 'right' }}>
          Developed with <Icon as={FaHeart} color="red.400" mx={1} /> for the Muslim community
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer; 