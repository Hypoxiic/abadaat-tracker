import React, { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Circle,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiMinus, FiPlus, FiRotateCcw, FiSettings, FiTrash2, FiX } from 'react-icons/fi';
import { FaRegStar } from 'react-icons/fa';
import PageHeader from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/Cards';
import DateNavigator from '../components/DateNavigator';
import { useActions, useAppState } from '../hooks/appState';
import { todayKey } from '../lib/dates';
import { getDay, totalDhikr, totalsForRange } from '../lib/stats';
import { newId } from '../lib/store';
import { TASBIH_AL_ZAHRA_IDS } from '../data/dhikr';
import type { DhikrPreset } from '../lib/types';

const vibrate = (pattern: number | number[]) => {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    /* vibration is a nicety, never a requirement */
  }
};

const DhikrTracker: React.FC = () => {
  const state = useAppState();
  const actions = useActions();
  const toast = useToast();
  const editor = useDisclosure();
  const [dateKey, setDateKey] = useState<string>(todayKey());
  const [focusId, setFocusId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DhikrPreset | null>(null);

  const day = getDay(state, dateKey);
  const total = totalDhikr(day);
  const weekly = useMemo(() => totalsForRange(state, 7), [state]);
  const presets = state.dhikrPresets.filter((preset) => !preset.hidden);
  const focused = presets.find((preset) => preset.id === focusId) ?? null;
  const goal = state.settings.goals.dhikrCount;

  const increment = (id: string, delta = 1) => {
    actions.adjustDhikr(dateKey, id, delta);
    if (delta > 0) vibrate(12);
  };

  const openEditor = (preset?: DhikrPreset) => {
    setDraft(
      preset ?? {
        id: newId('dhikr'),
        name: '',
        arabic: '',
        transliteration: '',
        translation: '',
        target: 33,
        colorScheme: 'brand',
        builtIn: false,
        hidden: false,
      },
    );
    editor.onOpen();
  };

  const saveDraft = () => {
    if (!draft || !draft.name.trim()) return;
    actions.upsertDhikrPreset({ ...draft, name: draft.name.trim() });
    editor.onClose();
    toast({ title: 'Dhikr saved', status: 'success', duration: 1800, position: 'bottom' });
  };

  const tasbihSequence = TASBIH_AL_ZAHRA_IDS.map((id) => ({
    preset: presets.find((item) => item.id === id),
    count: day.dhikr[id] ?? 0,
  })).filter((item) => item.preset);

  const tasbihComplete = tasbihSequence.every(
    (item) => item.preset && item.count >= item.preset.target,
  );

  return (
    <Box>
      <PageHeader
        eyebrow="Dhikr"
        title="Remembrance"
        description="Counters reset each day, so every day's remembrance is recorded separately."
        actions={<DateNavigator value={dateKey} onChange={setDateKey} />}
      />

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={{ base: 4, md: 5 }} mb={{ base: 4, md: 5 }}>
        <Box gridColumn={{ lg: 'span 2' }}>
          {focused ? (
            <SectionCard
              title={focused.name}
              subtitle={focused.translation}
              icon={FaRegStar}
              action={
                <IconButton
                  aria-label="Close focus mode"
                  icon={<Icon as={FiX} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setFocusId(null)}
                />
              }
            >
              <VStack spacing={5}>
                {focused.arabic && (
                  <Text className="arabic" fontSize="2xl" textAlign="center">
                    {focused.arabic}
                  </Text>
                )}

                <Circle
                  as="button"
                  type="button"
                  size={{ base: '200px', md: '240px' }}
                  bgGradient="linear(to-br, brand.500, brand.700)"
                  color="white"
                  onClick={() => increment(focused.id)}
                  onKeyDown={(event: React.KeyboardEvent) => {
                    if (event.key === ' ' || event.key === 'Enter') {
                      event.preventDefault();
                      increment(focused.id);
                    }
                  }}
                  aria-label={`Count ${focused.name}. Currently ${day.dhikr[focused.id] ?? 0}${
                    focused.target ? ` of ${focused.target}` : ''
                  }.`}
                  transition="transform 0.08s ease"
                  _active={{ transform: 'scale(0.96)' }}
                  boxShadow="lifted"
                  userSelect="none"
                >
                  <VStack spacing={0}>
                    <Heading size="3xl" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {day.dhikr[focused.id] ?? 0}
                    </Heading>
                    {focused.target > 0 && (
                      <Text fontSize="sm" opacity={0.85}>
                        of {focused.target}
                      </Text>
                    )}
                  </VStack>
                </Circle>

                {focused.target > 0 && (
                  <Box w="100%" maxW="320px">
                    <Progress
                      value={Math.min(100, ((day.dhikr[focused.id] ?? 0) / focused.target) * 100)}
                      size="sm"
                      aria-label={`${focused.name} progress`}
                    />
                  </Box>
                )}

                <HStack spacing={2}>
                  <Button
                    leftIcon={<Icon as={FiMinus} />}
                    variant="outline"
                    onClick={() => increment(focused.id, -1)}
                    isDisabled={(day.dhikr[focused.id] ?? 0) === 0}
                  >
                    Undo
                  </Button>
                  <Button
                    leftIcon={<Icon as={FiRotateCcw} />}
                    variant="ghost"
                    onClick={() => actions.setDhikr(dateKey, focused.id, 0)}
                  >
                    Reset
                  </Button>
                </HStack>

                <Text fontSize="xs" color="text.muted" textAlign="center">
                  Tap the circle, or press Space when it is focused.
                </Text>
              </VStack>
            </SectionCard>
          ) : (
            <SectionCard
              title="Counters"
              subtitle="Tap a card to open the full-size counter"
              icon={FaRegStar}
              action={
                <Button size="xs" variant="ghost" leftIcon={<Icon as={FiPlus} />} onClick={() => openEditor()}>
                  Add
                </Button>
              }
            >
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                {presets.map((preset) => {
                  const count = day.dhikr[preset.id] ?? 0;
                  const percent = preset.target ? Math.min(100, (count / preset.target) * 100) : 0;
                  const reached = preset.target > 0 && count >= preset.target;

                  return (
                    <Box
                      key={preset.id}
                      borderWidth="1px"
                      borderColor={reached ? `${preset.colorScheme}.300` : 'border.default'}
                      borderRadius="xl"
                      p={4}
                      transition="border-color 0.15s ease"
                      _hover={{ borderColor: `${preset.colorScheme}.400` }}
                    >
                      <Flex
                        as="button"
                        type="button"
                        onClick={() => setFocusId(preset.id)}
                        w="100%"
                        textAlign="left"
                        align="flex-start"
                        justify="space-between"
                        gap={2}
                        mb={2}
                        aria-label={`Open ${preset.name} counter`}
                      >
                        <Box minW={0}>
                          <Text fontWeight="700" noOfLines={1}>
                            {preset.name}
                          </Text>
                          {preset.transliteration && (
                            <Text fontSize="xs" color="text.muted" noOfLines={1}>
                              {preset.transliteration}
                            </Text>
                          )}
                        </Box>
                        {reached && (
                          <Badge colorScheme={preset.colorScheme} flexShrink={0}>
                            Done
                          </Badge>
                        )}
                      </Flex>

                      <HStack justify="space-between" align="baseline" mb={2}>
                        <Heading size="lg" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {count}
                        </Heading>
                        {preset.target > 0 && (
                          <Text fontSize="sm" color="text.muted">
                            / {preset.target}
                          </Text>
                        )}
                      </HStack>

                      {preset.target > 0 && (
                        <Progress
                          value={percent}
                          size="xs"
                          colorScheme={preset.colorScheme}
                          mb={3}
                          aria-label={`${preset.name} progress`}
                        />
                      )}

                      <HStack spacing={1}>
                        <IconButton
                          aria-label={`Decrease ${preset.name}`}
                          icon={<Icon as={FiMinus} />}
                          size="sm"
                          variant="outline"
                          onClick={() => increment(preset.id, -1)}
                          isDisabled={count === 0}
                        />
                        <Button
                          flex="1"
                          size="sm"
                          colorScheme={preset.colorScheme}
                          leftIcon={<Icon as={FiPlus} />}
                          onClick={() => increment(preset.id)}
                          aria-label={`Count ${preset.name}`}
                        >
                          Count
                        </Button>
                        <IconButton
                          aria-label={`Edit ${preset.name}`}
                          icon={<Icon as={FiSettings} />}
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditor(preset)}
                        />
                      </HStack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </SectionCard>
          )}
        </Box>

        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <SectionCard title="Today" icon={FaRegStar}>
            <Stat mb={3}>
              <StatLabel color="text.muted">Total recitations</StatLabel>
              <StatNumber fontSize="3xl">{total.toLocaleString()}</StatNumber>
            </Stat>
            {goal > 0 && (
              <>
                <Progress
                  value={Math.min(100, (total / goal) * 100)}
                  size="sm"
                  mb={2}
                  aria-label="Daily dhikr goal"
                />
                <Text fontSize="sm" color="text.muted">
                  {total >= goal ? 'Daily goal reached.' : `${goal - total} to reach today's goal.`}
                </Text>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              colorScheme="red"
              mt={4}
              w="100%"
              leftIcon={<Icon as={FiRotateCcw} />}
              onClick={() => {
                actions.resetDhikrForDay(dateKey);
                toast({ title: 'Counters reset', status: 'info', duration: 1800, position: 'bottom' });
              }}
              isDisabled={total === 0}
            >
              Reset this day
            </Button>
          </SectionCard>

          <SectionCard
            title="Tasbih of az-Zahra (a)"
            subtitle="34 · 33 · 33, recited after each prayer"
            icon={FaRegStar}
          >
            <VStack spacing={3} align="stretch">
              {tasbihSequence.map(({ preset, count }) => {
                if (!preset) return null;
                const done = count >= preset.target;
                return (
                  <Box key={preset.id}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm" fontWeight={done ? '700' : '500'}>
                        {preset.name}
                      </Text>
                      <Text fontSize="sm" color="text.muted" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {count}/{preset.target}
                      </Text>
                    </Flex>
                    <Progress
                      value={Math.min(100, (count / preset.target) * 100)}
                      size="xs"
                      colorScheme={done ? 'brand' : preset.colorScheme}
                      aria-label={`${preset.name} towards ${preset.target}`}
                    />
                  </Box>
                );
              })}
              {tasbihComplete && (
                <Badge colorScheme="brand" alignSelf="flex-start">
                  Complete for today
                </Badge>
              )}
            </VStack>
          </SectionCard>

          <SectionCard title="This week" icon={FaRegStar}>
            <SimpleGrid columns={2} spacing={4}>
              <Stat>
                <StatLabel color="text.muted">Total</StatLabel>
                <StatNumber>{weekly.dhikrCount.toLocaleString()}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="text.muted">Daily average</StatLabel>
                <StatNumber>{Math.round(weekly.dhikrCount / 7)}</StatNumber>
              </Stat>
            </SimpleGrid>
          </SectionCard>
        </VStack>
      </SimpleGrid>

      <Modal isOpen={editor.isOpen} onClose={editor.onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="surface.overlay">
          <ModalHeader>{draft?.builtIn ? 'Edit dhikr' : 'Custom dhikr'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {draft && (
              <VStack spacing={3} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Name</FormLabel>
                  <Input
                    value={draft.name}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    placeholder="e.g. Salawat"
                    autoFocus
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Arabic</FormLabel>
                  <Input
                    value={draft.arabic}
                    onChange={(event) => setDraft({ ...draft, arabic: event.target.value })}
                    dir="rtl"
                    fontFamily="arabic"
                    fontSize="lg"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Translation</FormLabel>
                  <Input
                    value={draft.translation}
                    onChange={(event) => setDraft({ ...draft, translation: event.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Daily target</FormLabel>
                  <NumberInput
                    min={0}
                    max={10000}
                    value={draft.target}
                    onChange={(_, value) =>
                      setDraft({ ...draft, target: Number.isNaN(value) ? 0 : value })
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter gap={2}>
            {draft && (
              <Button
                variant="ghost"
                colorScheme="red"
                leftIcon={<Icon as={FiTrash2} />}
                mr="auto"
                onClick={() => {
                  actions.removeDhikrPreset(draft.id);
                  if (focusId === draft.id) setFocusId(null);
                  editor.onClose();
                }}
              >
                {draft.builtIn ? 'Hide' : 'Delete'}
              </Button>
            )}
            <Button variant="ghost" onClick={editor.onClose}>
              Cancel
            </Button>
            <Button onClick={saveDraft} isDisabled={!draft?.name.trim()}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DhikrTracker;
