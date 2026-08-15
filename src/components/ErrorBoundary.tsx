import React from 'react';
import { Box, Button, Code, Container, Heading, Stack, Text } from '@chakra-ui/react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render errors so a single broken page cannot blank the whole app.
 * (The previous Du'a tracker called a hook inside a `.map()`, which crashed the
 * page with no recovery path.)
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Unhandled error in Abadaat Tracker:', error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <Container maxW="container.md" py={16}>
        <Stack spacing={5}>
          <Box>
            <Heading size="lg" mb={2}>
              Something went wrong
            </Heading>
            <Text color="text.secondary">
              Your tracked data is safe — it is stored on this device and was not affected.
            </Text>
          </Box>
          <Code
            p={4}
            borderRadius="lg"
            whiteSpace="pre-wrap"
            fontSize="sm"
            colorScheme="red"
            display="block"
          >
            {error.message}
          </Code>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={3}>
            <Button onClick={this.handleReset}>Try again</Button>
            <Button variant="outline" onClick={() => window.location.assign('/')}>
              Back to dashboard
            </Button>
          </Stack>
        </Stack>
      </Container>
    );
  }
}

export default ErrorBoundary;
