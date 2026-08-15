import React from 'react';
import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

/**
 * A real 404. The old router silently redirected every unknown path to the
 * dashboard, which made typos and stale links look like the app had reset.
 */
const NotFound: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <Box py={16} textAlign="center">
      <Text fontSize="sm" fontWeight="700" color="accent.solid" letterSpacing="0.08em">
        404
      </Text>
      <Heading size="lg" mt={2} mb={3}>
        Page not found
      </Heading>
      <Text color="text.secondary" mb={6}>
        There is nothing at <Text as="code">{pathname}</Text>.
      </Text>
      <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} justify="center">
        <Button as={RouterLink} to="/">
          Back to dashboard
        </Button>
        <Button as={RouterLink} to="/prayer" variant="outline">
          Prayer tracker
        </Button>
      </Stack>
    </Box>
  );
};

export default NotFound;
