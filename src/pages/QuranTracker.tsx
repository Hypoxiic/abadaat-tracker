import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Progress,
  Select,
  SimpleGrid,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { FiBookOpen, FiBookmark, FiPlus, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../components/ui/PageHeader';
import { EmptyState, SectionCard } from '../components/ui/Cards';
import DateNavigator from '../components/DateNavigator';
import { useActions, useAppState } from '../hooks/appState';
import { todayKey } from '../lib/dates';
import { getDay, totalQuranMinutes, totalQuranPages, totalsForRange } from '../lib/stats';
import {
  SURAHS,
  TOTAL_QURAN_PAGES,
  estimatePages,
  getSurah,
  surahLabel,
} from '../data/surahs';

const QuranTracker: React.FC = () => {
  const state = useAppState();
  const actions = useActions();
  const toast = useToast();
  const [dateKey, setDateKey] = useState<string>(todayKey());

  const day = getDay(state, dateKey);
  const pagesToday = totalQuranPages(day);
  const minutesToday = totalQuranMinutes(day);
  const goal = state.settings.goals.quranPages;
  const weekly = useMemo(() => totalsForRange(state, 7), [state]);

  const [surah, setSurah] = useState<number>(state.quran.bookmark.surah);
  const [startAyah, setStartAyah] = useState<number>(state.quran.bookmark.ayah);
  const [endAyah, setEndAyah] = useState<number>(state.quran.bookmark.ayah);
  const [pages, setPages] = useState<number>(0);
  const [pagesTouched, setPagesTouched] = useState(false);
  const [minutes, setMinutes] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const selectedSurah = getSurah(surah);
  const maxAyah = selectedSurah?.ayahs ?? 1;
  const estimated = useMemo(
    () => estimatePages(surah, startAyah, endAyah),
    [surah, startAyah, endAyah],
  );

  // Keep the page estimate in step with the ayah range until the user overrides it.
  useEffect(() => {
    if (!pagesTouched) setPages(estimated);
  }, [estimated, pagesTouched]);

  // Clamp the ayah range whenever the surah changes.
  useEffect(() => {
    setStartAyah((value) => Math.min(Math.max(1, value), maxAyah));
    setEndAyah((value) => Math.min(Math.max(1, value), maxAyah));
  }, [maxAyah]);

  const rangeInvalid = endAyah < startAyah;

  const handleAdd = () => {
    if (rangeInvalid) return;
    const finalPages = Math.max(0, pages);
    actions.addQuranEntry(dateKey, {
      surah,
      startAyah,
      endAyah,
      pages: finalPages,
      minutes: Math.max(0, minutes),
      notes: notes.trim(),
    });
    actions.addKhatmPages(finalPages);

    // Move the bookmark on so the next session starts where this one ended.
    const next = endAyah >= maxAyah ? { surah: Math.min(surah + 1, 114), ayah: 1 } : { surah, ayah: endAyah + 1 };
    actions.setBookmark(next.surah, next.ayah);
    setSurah(next.surah);
    setStartAyah(next.ayah);
    setEndAyah(next.ayah);
    setPagesTouched(false);
    setMinutes(0);
    setNotes('');

    toast({
      title: 'Reading recorded',
      description: `${surahLabel(surah)} · ${startAyah}–${endAyah}`,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'bottom',
    });
  };

  const khatmPercent = (state.quran.khatmPages / TOTAL_QURAN_PAGES) * 100;

  return (
    <Box>
      <PageHeader
        eyebrow="Tilawah"
        title="Qur'an tracker"
        description="Log what you read, keep your place, and follow your progress towards a khatm."
        actions={<DateNavigator value={dateKey} onChange={setDateKey} />}
      />

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 5 }}>
        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <SectionCard title="Record a reading" icon={FiPlus}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Surah</FormLabel>
                <Select
                  value={surah}
                  onChange={(event) => {
                    setSurah(Number(event.target.value));
                    setPagesTouched(false);
                  }}
                >
                  {SURAHS.map((item) => (
                    <option key={item.number} value={item.number}>
                      {item.number}. {item.name} — {item.ayahs} ayahs
                    </option>
                  ))}
                </Select>
                {selectedSurah && (
                  <FormHelperText>
                    <Text as="span" className="arabic" fontSize="md" display="inline-block">
                      {selectedSurah.arabic}
                    </Text>{' '}
                    · Revealed in {selectedSurah.revelation}
                  </FormHelperText>
                )}
              </FormControl>

              <SimpleGrid columns={2} spacing={3}>
                <FormControl isInvalid={rangeInvalid}>
                  <FormLabel fontSize="sm">From ayah</FormLabel>
                  <NumberInput
                    min={1}
                    max={maxAyah}
                    value={startAyah}
                    onChange={(_, value) => {
                      setStartAyah(Number.isNaN(value) ? 1 : value);
                      setPagesTouched(false);
                    }}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isInvalid={rangeInvalid}>
                  <FormLabel fontSize="sm">To ayah</FormLabel>
                  <NumberInput
                    min={1}
                    max={maxAyah}
                    value={endAyah}
                    onChange={(_, value) => {
                      setEndAyah(Number.isNaN(value) ? 1 : value);
                      setPagesTouched(false);
                    }}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              {rangeInvalid && (
                <Text fontSize="sm" color="red.500">
                  The last ayah must not come before the first.
                </Text>
              )}

              <SimpleGrid columns={2} spacing={3}>
                <FormControl>
                  <FormLabel fontSize="sm">Pages</FormLabel>
                  <NumberInput
                    min={0}
                    max={TOTAL_QURAN_PAGES}
                    step={0.5}
                    precision={1}
                    value={pages}
                    onChange={(_, value) => {
                      setPagesTouched(true);
                      setPages(Number.isNaN(value) ? 0 : value);
                    }}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>Estimated from your ayah range</FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Minutes</FormLabel>
                  <NumberInput
                    min={0}
                    max={600}
                    value={minutes}
                    onChange={(_, value) => setMinutes(Number.isNaN(value) ? 0 : value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>Optional</FormHelperText>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontSize="sm">Notes</FormLabel>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="A reflection, a word to look up, a verse to return to…"
                  rows={2}
                  resize="vertical"
                />
              </FormControl>

              <Button
                onClick={handleAdd}
                isDisabled={rangeInvalid}
                leftIcon={<Icon as={FiPlus} />}
                w="100%"
              >
                Add reading
              </Button>
            </VStack>
          </SectionCard>

          <SectionCard title="Khatm progress" icon={FiBookmark}>
            <Stat mb={3}>
              <StatLabel color="text.muted">Pages this khatm</StatLabel>
              <StatNumber>
                {Math.round(state.quran.khatmPages * 10) / 10} / {TOTAL_QURAN_PAGES}
              </StatNumber>
              <StatHelpText>
                {state.quran.khatmCount > 0
                  ? `${state.quran.khatmCount} completed khatm${state.quran.khatmCount === 1 ? '' : 's'}`
                  : 'Your first khatm is under way'}
              </StatHelpText>
            </Stat>
            <Progress value={khatmPercent} size="md" mb={2} aria-label="Khatm progress" />
            <Flex justify="space-between">
              <Text fontSize="sm" color="text.muted">
                {khatmPercent.toFixed(1)}% complete
              </Text>
              <Button size="xs" variant="ghost" colorScheme="red" onClick={actions.resetKhatm}>
                Reset khatm
              </Button>
            </Flex>

            <Divider my={4} />

            <HStack justify="space-between">
              <Box>
                <Text fontSize="sm" color="text.muted">
                  Bookmark
                </Text>
                <Text fontWeight="600">
                  {surahLabel(state.quran.bookmark.surah)} · ayah {state.quran.bookmark.ayah}
                </Text>
              </Box>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSurah(state.quran.bookmark.surah);
                  setStartAyah(state.quran.bookmark.ayah);
                  setEndAyah(state.quran.bookmark.ayah);
                  setPagesTouched(false);
                }}
              >
                Continue
              </Button>
            </HStack>
          </SectionCard>
        </VStack>

        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <SectionCard
            title="Today's reading"
            subtitle={`${pagesToday} page${pagesToday === 1 ? '' : 's'}${
              minutesToday ? ` · ${minutesToday} min` : ''
            }`}
            icon={FiBookOpen}
          >
            {goal > 0 && (
              <Box mb={4}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm" color="text.muted">
                    Daily goal
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {pagesToday} / {goal} pages
                  </Text>
                </Flex>
                <Progress
                  value={(pagesToday / goal) * 100}
                  size="sm"
                  colorScheme={pagesToday >= goal ? 'brand' : 'lapis'}
                  aria-label="Daily reading goal"
                />
              </Box>
            )}

            {day.quran.length === 0 ? (
              <EmptyState
                icon={FiBookOpen}
                title="Nothing recorded yet"
                description="Add a reading on the left and it will appear here."
              />
            ) : (
              <VStack spacing={2} align="stretch">
                {day.quran.map((entry) => (
                  <Flex
                    key={entry.id}
                    align="flex-start"
                    gap={3}
                    p={3}
                    borderWidth="1px"
                    borderColor="border.default"
                    borderRadius="xl"
                  >
                    <Box flex="1" minW={0}>
                      <HStack spacing={2} mb={1} wrap="wrap">
                        <Text fontWeight="600">{surahLabel(entry.surah)}</Text>
                        <Badge colorScheme="lapis" variant="subtle">
                          {entry.startAyah}–{entry.endAyah}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="text.muted">
                        {entry.pages} page{entry.pages === 1 ? '' : 's'}
                        {entry.minutes > 0 && ` · ${entry.minutes} min`}
                      </Text>
                      {entry.notes && (
                        <Text fontSize="sm" color="text.secondary" mt={1.5}>
                          {entry.notes}
                        </Text>
                      )}
                    </Box>
                    <IconButton
                      aria-label={`Delete reading of ${surahLabel(entry.surah)}`}
                      icon={<Icon as={FiTrash2} />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => {
                        actions.deleteQuranEntry(dateKey, entry.id);
                        actions.addKhatmPages(-entry.pages);
                        toast({
                          title: 'Reading removed',
                          status: 'info',
                          duration: 1800,
                          isClosable: true,
                          position: 'bottom',
                        });
                      }}
                    />
                  </Flex>
                ))}
              </VStack>
            )}
          </SectionCard>

          <SectionCard title="This week" icon={FiBookOpen}>
            <SimpleGrid columns={3} spacing={4}>
              <Stat>
                <StatLabel color="text.muted">Pages</StatLabel>
                <StatNumber>{weekly.quranPages}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="text.muted">Minutes</StatLabel>
                <StatNumber>{weekly.quranMinutes}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="text.muted">Daily average</StatLabel>
                <StatNumber>{Math.round((weekly.quranPages / 7) * 10) / 10}</StatNumber>
              </Stat>
            </SimpleGrid>
          </SectionCard>
        </VStack>
      </SimpleGrid>
    </Box>
  );
};

export default QuranTracker;
