import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PETS: '@pet_recorder_pets',
  HEALTH_RECORDS: '@pet_recorder_health_records',
  ACTIVITIES: '@pet_recorder_activities',
  REMINDERS: '@pet_recorder_reminders',
  SETTINGS: '@pet_recorder_settings',
};

// Generic storage helpers
const getItem = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
};

const setItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    return false;
  }
};

// Pets
export const getPets = async () => {
  return (await getItem(STORAGE_KEYS.PETS)) || [];
};

export const savePets = async (pets) => {
  return await setItem(STORAGE_KEYS.PETS, pets);
};

export const addPet = async (pet) => {
  const pets = await getPets();
  pets.push(pet);
  return await savePets(pets);
};

export const updatePet = async (updatedPet) => {
  const pets = await getPets();
  const index = pets.findIndex((p) => p.id === updatedPet.id);
  if (index !== -1) {
    pets[index] = updatedPet;
    return await savePets(pets);
  }
  return false;
};

export const deletePet = async (petId) => {
  const pets = await getPets();
  const filtered = pets.filter((p) => p.id !== petId);
  await savePets(filtered);
  // Also delete related records
  const healthRecords = await getHealthRecords();
  await saveHealthRecords(healthRecords.filter((r) => r.petId !== petId));
  const activities = await getActivities();
  await saveActivities(activities.filter((a) => a.petId !== petId));
  const reminders = await getReminders();
  await saveReminders(reminders.filter((r) => r.petId !== petId));
  return true;
};

// Health Records
export const getHealthRecords = async () => {
  return (await getItem(STORAGE_KEYS.HEALTH_RECORDS)) || [];
};

export const saveHealthRecords = async (records) => {
  return await setItem(STORAGE_KEYS.HEALTH_RECORDS, records);
};

export const addHealthRecord = async (record) => {
  const records = await getHealthRecords();
  records.push(record);
  return await saveHealthRecords(records);
};

export const updateHealthRecord = async (updatedRecord) => {
  const records = await getHealthRecords();
  const index = records.findIndex((r) => r.id === updatedRecord.id);
  if (index !== -1) {
    records[index] = updatedRecord;
    return await saveHealthRecords(records);
  }
  return false;
};

export const deleteHealthRecord = async (recordId) => {
  const records = await getHealthRecords();
  return await saveHealthRecords(records.filter((r) => r.id !== recordId));
};

export const getHealthRecordsByPet = async (petId) => {
  const records = await getHealthRecords();
  return records.filter((r) => r.petId === petId);
};

// Activities
export const getActivities = async () => {
  return (await getItem(STORAGE_KEYS.ACTIVITIES)) || [];
};

export const saveActivities = async (activities) => {
  return await setItem(STORAGE_KEYS.ACTIVITIES, activities);
};

export const addActivity = async (activity) => {
  const activities = await getActivities();
  activities.push(activity);
  return await saveActivities(activities);
};

export const deleteActivity = async (activityId) => {
  const activities = await getActivities();
  return await saveActivities(activities.filter((a) => a.id !== activityId));
};

export const getActivitiesByPet = async (petId) => {
  const activities = await getActivities();
  return activities.filter((a) => a.petId === petId);
};

// Reminders
export const getReminders = async () => {
  return (await getItem(STORAGE_KEYS.REMINDERS)) || [];
};

export const saveReminders = async (reminders) => {
  return await setItem(STORAGE_KEYS.REMINDERS, reminders);
};

export const addReminder = async (reminder) => {
  const reminders = await getReminders();
  reminders.push(reminder);
  return await saveReminders(reminders);
};

export const updateReminder = async (updatedReminder) => {
  const reminders = await getReminders();
  const index = reminders.findIndex((r) => r.id === updatedReminder.id);
  if (index !== -1) {
    reminders[index] = updatedReminder;
    return await saveReminders(reminders);
  }
  return false;
};

export const deleteReminder = async (reminderId) => {
  const reminders = await getReminders();
  return await saveReminders(reminders.filter((r) => r.id !== reminderId));
};

export const getRemindersByPet = async (petId) => {
  const reminders = await getReminders();
  return reminders.filter((r) => r.petId === petId);
};

// Settings
export const getSettings = async () => {
  const defaults = {
    darkMode: false,
    notificationsEnabled: true,
    defaultPetType: 'dog',
  };
  const saved = await getItem(STORAGE_KEYS.SETTINGS);
  return { ...defaults, ...saved };
};

export const saveSettings = async (settings) => {
  return await setItem(STORAGE_KEYS.SETTINGS, settings);
};

// Clear all data
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
