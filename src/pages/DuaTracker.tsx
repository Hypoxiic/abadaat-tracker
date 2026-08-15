import React, { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  FiCheck,
  FiExternalLink,
  FiHeart,
  FiPlus,
  FiSearch,
  FiSettings,
  FiTrash2,
} from 'react-icons/fi';
import { LuHeartHandshake } from 'react-icons/lu';
import PageHeader from '../components/ui/PageHeader';
import { EmptyState, SectionCard } from '../components/ui/Cards';
import DateNavigator from '../components/DateNavigator';
import { useActions, useAppState } from '../hooks/appState';
import { todayKey } from '../lib/dates';
import { getDay, totalDuas, totalsForRange } from '../lib/stats';
import { newId } from '../lib/store';
import { DUA_CATEGORIES, DUA_RESOURCES } from '../data/duas';
import type { DuaItem } from '../lib/types';

/** Only http(s) links are rendered, so stored data cannot inject a javascript: URL. */
const safeHref = (link: string): string | null => {
  try {
    const url = new URL(link);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

const DuaTracker: React.FC = () => {
  const state = useAppState();
  const actions = useActions();
  const toast = useToast();
  const editor = useDisclosure();
  const [dateKey, setDateKey] = useState<string>(todayKey());
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [draft, setDraft] = useState<DuaItem | null>(null);

  const day = getDay(state, dateKey);
  const logged = useMemo(
    () => new Map(day.duas.map((entry) => [entry.duaId, entry.count])),
    [day.duas],
  );
  const weekly = useMemo(() => totalsForRange(state, 7), [state]);

  const library = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.duas
      .filter((dua) => !dua.hidden)
      .filter((dua) => (category === 'all' ? true : dua.category === category))
      .filter((dua) => (favouritesOnly ? dua.favourite : true))
      .filter((dua) =>
        needle
          ? `${dua.name} ${dua.translation} ${dua.category} ${dua.notes}`
              .toLowerCase()
              .includes(needle)
          : true,
      )
      .sort((a, b) => {
        if (a.favourite !== b.favourite) return a.favourite ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [state.duas, query, category, favouritesOnly]);

  const openEditor = (dua?: DuaItem) => {
    setDraft(
      dua ?? {
        id: newId('dua'),
        name: '',
        arabic: '',
        translation: '',
        category: DUA_CATEGORIES[0],
        link: '',
        notes: '',
        favourite: false,
        builtIn: false,
        hidden: false,
      },
    );
    editor.onOpen();
  };

  const saveDraft = () => {
    if (!draft || !draft.name.trim()) return;
    actions.upsertDua({ ...draft, name: draft.name.trim() });
    editor.onClose();
    toast({ title: "Du'a saved", status: 'success', duration: 1800, position: 'bottom' });
  };

  return (
    <Box>
      <PageHeader
        eyebrow="Supplication"
        title="Du'a tracker"
        description="Keep a library of the du'as and ziyarat you recite, and record them each day."
        actions={<DateNavigator value={dateKey} onChange={setDateKey} />}
      />

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={{ base: 4, md: 5 }}>
        <Box gridColumn={{ lg: 'span 2' }}>
          <SectionCard
            title="Library"
            subtitle={`${library.length} du'a${library.length === 1 ? '' : 's'}`}
            icon={LuHeartHandshake}
            action={
              <Button size="xs" variant="ghost" leftIcon={<Icon as={FiPlus} />} onClick={() => openEditor()}>
                Add
              </Button>
            }
          >
            <Flex gap={2} mb={4} wrap="wrap">
              <InputGroup size="sm" flex="1" minW="180px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="text.muted" />
                </InputLeftElement>
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search du'as"
                  borderRadius="lg"
                  aria-label="Search du'as"
                />
              </InputGroup>
              <Select
                size="sm"
                w="auto"
                borderRadius="lg"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Filter by category"
              >
                <option value="all">All categories</option>
                {DUA_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                variant={favouritesOnly ? 'solid' : 'outline'}
                colorScheme="plum"
                leftIcon={<Icon as={FiHeart} />}
                onClick={() => setFavouritesOnly((value) => !value)}
                aria-pressed={favouritesOnly}
              >
                Favourites
              </Button>
            </Flex>

            {library.length === 0 ? (
              <EmptyState
                icon={FiSearch}
                title="Nothing matches"
                description="Try a different search, or add a du'a of your own."
                action={
                  <Button size="sm" onClick={() => openEditor()}>
                    Add a du'a
                  </Button>
                }
              />
            ) : (
              <VStack spacing={3} align="stretch">
                {library.map((dua) => {
                  const count = logged.get(dua.id) ?? 0;
                  const href = safeHref(dua.link);

                  return (
                    <Box
                      key={dua.id}
                      borderWidth="1px"
                      borderColor={count > 0 ? 'brand.200' : 'border.default'}
                      _dark={{ borderColor: count > 0 ? 'brand.600' : 'border.default' }}
                      borderRadius="xl"
                      p={4}
                    >
                      <Flex justify="space-between" gap={3} align="flex-start" mb={2}>
                        <Box minW={0}>
                          <HStack spacing={2} wrap="wrap">
                            <Text fontWeight="700">{dua.name}</Text>
                            <Badge colorScheme="plum" variant="subtle">
                              {dua.category}
                            </Badge>
                            {count > 0 && (
                              <Badge colorScheme="brand">
                                {count}× today
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                        <HStack spacing={0.5} flexShrink={0}>
                          <IconButton
                            aria-label={
                              dua.favourite
                                ? `Remove ${dua.name} from favourites`
                                : `Add ${dua.name} to favourites`
                            }
                            icon={<Icon as={FiHeart} fill={dua.favourite ? 'currentColor' : 'none'} />}
                            size="sm"
                            variant="ghost"
                            colorScheme={dua.favourite ? 'red' : 'gray'}
                            onClick={() => actions.toggleDuaFavourite(dua.id)}
                          />
                          {href && (
                            <IconButton
                              as={Link}
                              href={href}
                              isExternal
                              aria-label={`Open ${dua.name} in a new tab`}
                              icon={<Icon as={FiExternalLink} />}
                              size="sm"
                              variant="ghost"
                            />
                          )}
                          <IconButton
                            aria-label={`Edit ${dua.name}`}
                            icon={<Icon as={FiSettings} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditor(dua)}
                          />
                        </HStack>
                      </Flex>

                      {dua.arabic && (
                        <Text className="arabic" fontSize="lg" mb={2} noOfLines={2}>
                          {dua.arabic}
                        </Text>
                      )}
                      {dua.translation && (
                        <Text fontSize="sm" color="text.secondary" mb={2} noOfLines={3}>
                          {dua.translation}
                        </Text>
                      )}
                      {dua.notes && (
                        <Text fontSize="xs" color="text.muted" mb={2}>
                          {dua.notes}
                        </Text>
                      )}

                      <HStack spacing={2} mt={3}>
                        <Button
                          size="sm"
                          colorScheme={count > 0 ? 'brand' : 'gray'}
                          variant={count > 0 ? 'solid' : 'outline'}
                          leftIcon={<Icon as={count > 0 ? FiCheck : FiPlus} />}
                          onClick={() => actions.logDua(dateKey, dua.id, 1)}
                          aria-label={`Record a recitation of ${dua.name}`}
                        >
                          {count > 0 ? 'Recite again' : 'Recited'}
                        </Button>
                        {count > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => actions.logDua(dateKey, dua.id, -1)}
                            aria-label={`Undo a recitation of ${dua.name}`}
                          >
                            Undo
                          </Button>
                        )}
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </SectionCard>
        </Box>

        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <SectionCard title="Recorded this day" icon={LuHeartHandshake}>
            <Stat mb={4}>
              <StatLabel color="text.muted">Total recitations</StatLabel>
              <StatNumber fontSize="3xl">{totalDuas(day)}</StatNumber>
            </Stat>

            {day.duas.length === 0 ? (
              <Text fontSize="sm" color="text.muted">
                Nothing recorded yet for this day.
              </Text>
            ) : (
              <VStack spacing={2} align="stretch">
                {day.duas.map((entry) => {
                  const dua = state.duas.find((item) => item.id === entry.duaId);
                  return (
                    <Flex key={entry.duaId} justify="space-between" align="center" gap={2}>
                      <Text fontSize="sm" noOfLines={1}>
                        {dua?.name ?? 'Removed du\'a'}
                      </Text>
                      <HStack spacing={1} flexShrink={0}>
                        <Badge>{entry.count}×</Badge>
                        <IconButton
                          aria-label={`Remove ${dua?.name ?? "du'a"} from this day`}
                          icon={<Icon as={FiTrash2} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => actions.unlogDua(dateKey, entry.duaId)}
                        />
                      </HStack>
                    </Flex>
                  );
                })}
              </VStack>
            )}
          </SectionCard>

          <SectionCard title="This week" icon={LuHeartHandshake}>
            <SimpleGrid columns={2} spacing={4}>
              <Stat>
                <StatLabel color="text.muted">Recitations</StatLabel>
                <StatNumber>{weekly.duaCount}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel color="text.muted">Favourites</StatLabel>
                <StatNumber>{state.duas.filter((dua) => dua.favourite && !dua.hidden).length}</StatNumber>
              </Stat>
            </SimpleGrid>
          </SectionCard>

          <SectionCard title="Resources" icon={FiExternalLink}>
            <VStack spacing={3} align="stretch">
              {DUA_RESOURCES.map((resource) => (
                <Link
                  key={resource.url}
                  href={resource.url}
                  isExternal
                  p={3}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="border.default"
                  _hover={{ borderColor: 'accent.solid', textDecoration: 'none' }}
                >
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="600" fontSize="sm">
                        {resource.name}
                      </Text>
                      <Text fontSize="xs" color="text.muted">
                        {resource.description}
                      </Text>
                    </Box>
                    <Icon as={FiExternalLink} color="text.muted" flexShrink={0} />
                  </HStack>
                </Link>
              ))}
            </VStack>
          </SectionCard>
        </VStack>
      </SimpleGrid>

      <Modal isOpen={editor.isOpen} onClose={editor.onClose} size="lg" isCentered scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg="surface.overlay">
          <ModalHeader>{draft?.builtIn ? "Edit du'a" : "Custom du'a"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {draft && (
              <VStack spacing={3} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Name</FormLabel>
                  <Input
                    value={draft.name}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    placeholder="e.g. Du'a al-Faraj"
                    autoFocus
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Category</FormLabel>
                  <Select
                    value={draft.category}
                    onChange={(event) => setDraft({ ...draft, category: event.target.value })}
                  >
                    {DUA_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Arabic</FormLabel>
                  <Textarea
                    value={draft.arabic}
                    onChange={(event) => setDraft({ ...draft, arabic: event.target.value })}
                    dir="rtl"
                    fontFamily="arabic"
                    fontSize="lg"
                    rows={2}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Translation</FormLabel>
                  <Textarea
                    value={draft.translation}
                    onChange={(event) => setDraft({ ...draft, translation: event.target.value })}
                    rows={3}
                  />
                </FormControl>
                <FormControl isInvalid={!!draft.link && !safeHref(draft.link)}>
                  <FormLabel fontSize="sm">Link</FormLabel>
                  <Input
                    value={draft.link}
                    onChange={(event) => setDraft({ ...draft, link: event.target.value })}
                    placeholder="https://www.duas.org/…"
                    type="url"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Notes</FormLabel>
                  <Input
                    value={draft.notes}
                    onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                    placeholder="When you recite it, why it matters to you…"
                  />
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
                  actions.removeDua(draft.id);
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

export default DuaTracker;
