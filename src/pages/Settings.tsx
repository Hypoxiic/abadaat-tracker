import React, { useRef, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  VStack,
  useColorMode,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  FiBell,
  FiDatabase,
  FiDownload,
  FiEye,
  FiMapPin,
  FiTarget,
  FiTrash2,
  FiUpload,
} from 'react-icons/fi';
import { FaKaaba } from 'react-icons/fa';
import PageHeader from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/Cards';
import { useActions, useAppState } from '../hooks/appState';
import {
  CUSTOM_LOCATION_ID,
  PRESET_LOCATIONS,
  resolveLocation,
} from '../data/locations';
import { CALCULATION_METHOD_LIST, TIME_LABELS } from '../lib/prayerTimes';
import {
  notificationPermission,
  requestNotificationPermission,
} from '../hooks/usePrayerNotifications';
import { PRAYER_KEYS } from '../lib/types';
import type { GeoLocation } from '../lib/types';

const Settings: React.FC = () => {
  const state = useAppState();
  const actions = useActions();
  const { colorMode, setColorMode } = useColorMode();
  const toast = useToast();
  const clearDialog = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [permission, setPermission] = useState(notificationPermission());

  const settings = state.settings;
  const location = resolveLocation(settings.locationId, settings.customLocation);

  const handleExport = () => {
    // The previous export ran JSON.parse over every localStorage value and threw
    // on the first non-JSON entry (such as Chakra's colour-mode string).
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `abadaat-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Data exported', status: 'success', duration: 2500, position: 'bottom' });
  };

  const handleImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      actions.replaceState(parsed);
      toast({
        title: 'Data imported',
        description: 'Your backup has been restored.',
        status: 'success',
        duration: 3000,
        position: 'bottom',
      });
    } catch {
      toast({
        title: 'Import failed',
        description: 'That file is not a valid Abadaat Tracker export.',
        status: 'error',
        duration: 4000,
        position: 'bottom',
      });
    }
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      toast({ title: 'Location is not available in this browser', status: 'error', duration: 3000 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const custom: GeoLocation = {
          id: 'custom',
          name: 'My location',
          country: '',
          latitude: Math.round(position.coords.latitude * 10000) / 10000,
          longitude: Math.round(position.coords.longitude * 10000) / 10000,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        };
        actions.updateSettings({ locationId: CUSTOM_LOCATION_ID, customLocation: custom });
        toast({ title: 'Location updated', status: 'success', duration: 2500, position: 'bottom' });
      },
      () => toast({ title: 'Could not read your location', status: 'error', duration: 3000 }),
      { timeout: 10_000 },
    );
  };

  const enableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    actions.updateSettings({ notificationsEnabled: result === 'granted' });
    if (result !== 'granted') {
      toast({
        title: 'Notifications not enabled',
        description: 'Your browser blocked the request. Allow notifications in site settings to use reminders.',
        status: 'warning',
        duration: 4000,
      });
    }
  };

  const updateCustomLocation = (patch: Partial<GeoLocation>) =>
    actions.updateSettings({
      locationId: CUSTOM_LOCATION_ID,
      customLocation: {
        id: 'custom',
        name: settings.customLocation?.name ?? 'My location',
        country: settings.customLocation?.country ?? '',
        latitude: settings.customLocation?.latitude ?? location.latitude,
        longitude: settings.customLocation?.longitude ?? location.longitude,
        timeZone:
          settings.customLocation?.timeZone ??
          Intl.DateTimeFormat().resolvedOptions().timeZone ??
          'UTC',
        ...patch,
      },
    });

  return (
    <Box>
      <PageHeader
        title="Settings"
        description="Prayer time calculation, goals and your data. Everything is stored on this device."
      />

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 5 }} alignItems="start">
        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <SectionCard title="Location" icon={FiMapPin}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">City</FormLabel>
                <Select
                  value={settings.locationId}
                  onChange={(event) => actions.updateSettings({ locationId: event.target.value })}
                >
                  {PRESET_LOCATIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}, {item.country}
                    </option>
                  ))}
                  <option value={CUSTOM_LOCATION_ID}>Custom coordinates</option>
                </Select>
                <FormHelperText>
                  Times are computed from the sun's position, so any location works.
                </FormHelperText>
              </FormControl>

              {settings.locationId === CUSTOM_LOCATION_ID && (
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="sm">Latitude</FormLabel>
                    <NumberInput
                      value={settings.customLocation?.latitude ?? 0}
                      min={-90}
                      max={90}
                      step={0.0001}
                      precision={4}
                      onChange={(_, value) =>
                        updateCustomLocation({ latitude: Number.isNaN(value) ? 0 : value })
                      }
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">Longitude</FormLabel>
                    <NumberInput
                      value={settings.customLocation?.longitude ?? 0}
                      min={-180}
                      max={180}
                      step={0.0001}
                      precision={4}
                      onChange={(_, value) =>
                        updateCustomLocation({ longitude: Number.isNaN(value) ? 0 : value })
                      }
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                  <FormControl gridColumn={{ sm: 'span 2' }}>
                    <FormLabel fontSize="sm">Time zone</FormLabel>
                    <Input
                      value={settings.customLocation?.timeZone ?? ''}
                      onChange={(event) => updateCustomLocation({ timeZone: event.target.value })}
                      placeholder="Europe/London"
                    />
                  </FormControl>
                </SimpleGrid>
              )}

              <Button size="sm" variant="outline" onClick={useMyLocation} leftIcon={<Icon as={FiMapPin} />}>
                Use my current location
              </Button>

              <Text fontSize="xs" color="text.muted">
                Using {location.name} at {location.latitude.toFixed(3)}°, {location.longitude.toFixed(3)}° ({location.timeZone}).
              </Text>
            </VStack>
          </SectionCard>

          <SectionCard title="Prayer time calculation" icon={FaKaaba}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Method</FormLabel>
                <Select
                  value={settings.method}
                  onChange={(event) =>
                    actions.updateSettings({ method: event.target.value as typeof settings.method })
                  }
                >
                  {CALCULATION_METHOD_LIST.map((method) => (
                    <option key={method.key} value={method.key}>
                      {method.name}
                    </option>
                  ))}
                </Select>
                <FormHelperText>
                  {CALCULATION_METHOD_LIST.find((m) => m.key === settings.method)?.description}
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Asr</FormLabel>
                <RadioGroup
                  value={settings.asrMadhab}
                  onChange={(value) =>
                    actions.updateSettings({ asrMadhab: value as typeof settings.asrMadhab })
                  }
                >
                  <Stack direction="row" spacing={5}>
                    <Radio value="standard">Standard (shadow ×1)</Radio>
                    <Radio value="hanafi">Hanafi (shadow ×2)</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Islamic midnight</FormLabel>
                <RadioGroup
                  value={settings.midnightMode}
                  onChange={(value) =>
                    actions.updateSettings({ midnightMode: value as typeof settings.midnightMode })
                  }
                >
                  <Stack spacing={1}>
                    <Radio value="jafari">Sunset to Fajr (Ja'fari)</Radio>
                    <Radio value="standard">Sunset to sunrise</Radio>
                  </Stack>
                </RadioGroup>
                <FormHelperText>Determines when Isha becomes qadha.</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">High latitude rule</FormLabel>
                <Select
                  value={settings.highLatitudeRule}
                  onChange={(event) =>
                    actions.updateSettings({
                      highLatitudeRule: event.target.value as typeof settings.highLatitudeRule,
                    })
                  }
                >
                  <option value="none">None</option>
                  <option value="middleOfNight">Middle of the night</option>
                  <option value="seventhOfNight">One seventh of the night</option>
                  <option value="angleBased">Angle based</option>
                </Select>
                <FormHelperText>
                  Used in summer at northern latitudes, where twilight never ends.
                </FormHelperText>
              </FormControl>

              <Divider />

              <Box>
                <FormLabel fontSize="sm" mb={2}>
                  Manual adjustments (minutes)
                </FormLabel>
                <SimpleGrid columns={{ base: 2, sm: 5 }} spacing={2}>
                  {PRAYER_KEYS.map((key) => (
                    <FormControl key={key}>
                      <FormLabel fontSize="xs" color="text.muted" mb={1}>
                        {TIME_LABELS[key]}
                      </FormLabel>
                      <NumberInput
                        size="sm"
                        min={-60}
                        max={60}
                        value={settings.adjustments[key]}
                        onChange={(_, value) =>
                          actions.updateSettings({
                            adjustments: {
                              ...settings.adjustments,
                              [key]: Number.isNaN(value) ? 0 : value,
                            },
                          })
                        }
                      >
                        <NumberInputField px={2} />
                      </NumberInput>
                    </FormControl>
                  ))}
                </SimpleGrid>
              </Box>
            </VStack>
          </SectionCard>
        </VStack>

        <VStack spacing={{ base: 4, md: 5 }} align="stretch">
          <SectionCard title="Display" icon={FiEye}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Theme</FormLabel>
                <RadioGroup value={colorMode} onChange={(value) => setColorMode(value)}>
                  <Stack direction="row" spacing={5}>
                    <Radio value="light">Light</Radio>
                    <Radio value="dark">Dark</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Time format</FormLabel>
                <RadioGroup
                  value={settings.timeFormat}
                  onChange={(value) =>
                    actions.updateSettings({ timeFormat: value as typeof settings.timeFormat })
                  }
                >
                  <Stack direction="row" spacing={5}>
                    <Radio value="12h">12 hour</Radio>
                    <Radio value="24h">24 hour</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel htmlFor="hijri" mb={0} fontSize="sm">
                  Show Hijri date
                </FormLabel>
                <Switch
                  id="hijri"
                  isChecked={settings.showHijriDate}
                  onChange={(event) => actions.updateSettings({ showHijriDate: event.target.checked })}
                />
              </FormControl>

              {settings.showHijriDate && (
                <FormControl>
                  <FormLabel fontSize="sm">Hijri adjustment (days)</FormLabel>
                  <NumberInput
                    size="sm"
                    min={-3}
                    max={3}
                    value={settings.hijriOffset}
                    onChange={(_, value) =>
                      actions.updateSettings({ hijriOffset: Number.isNaN(value) ? 0 : value })
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>Align with your local moon sighting.</FormHelperText>
                </FormControl>
              )}
            </VStack>
          </SectionCard>

          <SectionCard title="Daily goals" icon={FiTarget}>
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
              <FormControl>
                <FormLabel fontSize="sm">Qur'an pages</FormLabel>
                <NumberInput
                  min={0}
                  max={604}
                  value={settings.goals.quranPages}
                  onChange={(_, value) =>
                    actions.updateSettings({
                      goals: { ...settings.goals, quranPages: Number.isNaN(value) ? 0 : value },
                    })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Dhikr count</FormLabel>
                <NumberInput
                  min={0}
                  max={10000}
                  step={10}
                  value={settings.goals.dhikrCount}
                  onChange={(_, value) =>
                    actions.updateSettings({
                      goals: { ...settings.goals, dhikrCount: Number.isNaN(value) ? 0 : value },
                    })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Du'a</FormLabel>
                <NumberInput
                  min={0}
                  max={100}
                  value={settings.goals.duaCount}
                  onChange={(_, value) =>
                    actions.updateSettings({
                      goals: { ...settings.goals, duaCount: Number.isNaN(value) ? 0 : value },
                    })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
          </SectionCard>

          <SectionCard title="Prayer reminders" icon={FiBell}>
            <VStack spacing={4} align="stretch">
              {permission === 'unsupported' ? (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    This browser does not support notifications.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <FormControl display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <FormLabel htmlFor="notifications" mb={0} fontSize="sm">
                        Notify me before each prayer
                      </FormLabel>
                      <Text fontSize="xs" color="text.muted">
                        Works while the app is open in a tab.
                      </Text>
                    </Box>
                    <Switch
                      id="notifications"
                      isChecked={settings.notificationsEnabled && permission === 'granted'}
                      onChange={(event) => {
                        if (event.target.checked && permission !== 'granted') {
                          void enableNotifications();
                        } else {
                          actions.updateSettings({ notificationsEnabled: event.target.checked });
                        }
                      }}
                    />
                  </FormControl>

                  {permission === 'denied' && (
                    <Alert status="warning" borderRadius="lg">
                      <AlertIcon />
                      <AlertDescription fontSize="sm">
                        Notifications are blocked for this site. Allow them in your browser settings.
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormControl>
                    <FormLabel fontSize="sm">Remind me this many minutes before</FormLabel>
                    <NumberInput
                      min={0}
                      max={60}
                      value={settings.notificationLeadMinutes}
                      onChange={(_, value) =>
                        actions.updateSettings({
                          notificationLeadMinutes: Number.isNaN(value) ? 0 : value,
                        })
                      }
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </>
              )}
            </VStack>
          </SectionCard>

          <SectionCard title="Your data" icon={FiDatabase}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="text.secondary">
                Everything is stored locally in this browser. Export a backup before clearing your
                browser data or moving to another device.
              </Text>

              <Flex gap={2} wrap="wrap">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={FiDownload} />}
                  onClick={handleExport}
                >
                  Export JSON
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Icon as={FiUpload} />}
                  onClick={() => fileRef.current?.click()}
                >
                  Import backup
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleImport(file);
                    event.target.value = '';
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  leftIcon={<Icon as={FiTrash2} />}
                  onClick={clearDialog.onOpen}
                >
                  Clear tracked data
                </Button>
              </Flex>

              <HStack spacing={6} pt={2}>
                <Box>
                  <Text fontSize="xs" color="text.muted">
                    Days recorded
                  </Text>
                  <Text fontWeight="700">{Object.keys(state.days).length}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="text.muted">
                    Du'as in library
                  </Text>
                  <Text fontWeight="700">{state.duas.filter((d) => !d.hidden).length}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="text.muted">
                    Dhikr counters
                  </Text>
                  <Text fontWeight="700">{state.dhikrPresets.filter((d) => !d.hidden).length}</Text>
                </Box>
              </HStack>
            </VStack>
          </SectionCard>
        </VStack>
      </SimpleGrid>

      <AlertDialog
        isOpen={clearDialog.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={clearDialog.onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="surface.overlay">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Clear tracked data?
            </AlertDialogHeader>
            <AlertDialogBody>
              This removes every recorded day, along with your custom dhikr and du'as. Your
              settings are kept. This cannot be undone — export a backup first if you are unsure.
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button ref={cancelRef} variant="ghost" onClick={clearDialog.onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  actions.clearAll();
                  clearDialog.onClose();
                  toast({
                    title: 'Tracked data cleared',
                    status: 'info',
                    duration: 3000,
                    position: 'bottom',
                  });
                }}
              >
                Clear everything
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Settings;
