import React, { createContext, useContext, useReducer, useEffect, useMemo, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { Alert, AppState } from 'react-native';
import * as Storage from '../utils/storage';
import {
  scheduleReminderNotification,
  cancelReminderNotification,
  cancelAllNotifications,
  rescheduleAllReminders,
  requestNotificationPermissions,
  isExpoGo,
} from '../utils/notifications';
import { LightTheme, DarkTheme } from '../theme/theme';

const AppContext = createContext();

const initialState = {
  pets: [],
  healthRecords: [],
  activities: [],
  reminders: [],
  families: [],
  settings: {
    darkMode: false,
    notificationsEnabled: true,
    defaultPetType: 'cat',
  },
  isLoading: true,
  selectedPet: null,
};

const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOAD_ALL_DATA: 'LOAD_ALL_DATA',
  // Pets
  SET_PETS: 'SET_PETS',
  ADD_PET: 'ADD_PET',
  UPDATE_PET: 'UPDATE_PET',
  DELETE_PET: 'DELETE_PET',
  SELECT_PET: 'SELECT_PET',
  // Health Records
  SET_HEALTH_RECORDS: 'SET_HEALTH_RECORDS',
  ADD_HEALTH_RECORD: 'ADD_HEALTH_RECORD',
  UPDATE_HEALTH_RECORD: 'UPDATE_HEALTH_RECORD',
  DELETE_HEALTH_RECORD: 'DELETE_HEALTH_RECORD',
  // Activities
  SET_ACTIVITIES: 'SET_ACTIVITIES',
  ADD_ACTIVITY: 'ADD_ACTIVITY',
  UPDATE_ACTIVITY: 'UPDATE_ACTIVITY',
  DELETE_ACTIVITY: 'DELETE_ACTIVITY',
  // Reminders
  SET_REMINDERS: 'SET_REMINDERS',
  ADD_REMINDER: 'ADD_REMINDER',
  UPDATE_REMINDER: 'UPDATE_REMINDER',
  DELETE_REMINDER: 'DELETE_REMINDER',
  // Settings
  SET_SETTINGS: 'SET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  // Families
  SET_FAMILIES: 'SET_FAMILIES',
  ADD_FAMILY: 'ADD_FAMILY',
  UPDATE_FAMILY: 'UPDATE_FAMILY',
  DELETE_FAMILY: 'DELETE_FAMILY',
  // Clear
  CLEAR_ALL: 'CLEAR_ALL',
};

function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case actionTypes.LOAD_ALL_DATA:
      return { ...state, ...action.payload, isLoading: false };
    // Pets
    case actionTypes.SET_PETS:
      return { ...state, pets: action.payload };
    case actionTypes.ADD_PET:
      return { ...state, pets: [...state.pets, action.payload] };
    case actionTypes.UPDATE_PET:
      return {
        ...state,
        pets: state.pets.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
        selectedPet:
          state.selectedPet?.id === action.payload.id
            ? action.payload
            : state.selectedPet,
      };
    case actionTypes.DELETE_PET:
      return {
        ...state,
        pets: state.pets.filter((p) => p.id !== action.payload),
        healthRecords: state.healthRecords.filter(
          (r) => r.petId !== action.payload
        ),
        activities: state.activities.filter(
          (a) => a.petId !== action.payload
        ),
        reminders: state.reminders.filter(
          (r) => r.petId !== action.payload
        ),
        selectedPet:
          state.selectedPet?.id === action.payload ? null : state.selectedPet,
      };
    case actionTypes.SELECT_PET:
      return { ...state, selectedPet: action.payload };
    // Health Records
    case actionTypes.SET_HEALTH_RECORDS:
      return { ...state, healthRecords: action.payload };
    case actionTypes.ADD_HEALTH_RECORD:
      return {
        ...state,
        healthRecords: [...state.healthRecords, action.payload],
      };
    case actionTypes.UPDATE_HEALTH_RECORD:
      return {
        ...state,
        healthRecords: state.healthRecords.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
    case actionTypes.DELETE_HEALTH_RECORD:
      return {
        ...state,
        healthRecords: state.healthRecords.filter(
          (r) => r.id !== action.payload
        ),
      };
    // Activities
    case actionTypes.SET_ACTIVITIES:
      return { ...state, activities: action.payload };
    case actionTypes.ADD_ACTIVITY:
      return {
        ...state,
        activities: [...state.activities, action.payload],
      };
    case actionTypes.UPDATE_ACTIVITY:
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case actionTypes.DELETE_ACTIVITY:
      return {
        ...state,
        activities: state.activities.filter((a) => a.id !== action.payload),
      };
    // Reminders
    case actionTypes.SET_REMINDERS:
      return { ...state, reminders: action.payload };
    case actionTypes.ADD_REMINDER:
      return {
        ...state,
        reminders: [...state.reminders, action.payload],
      };
    case actionTypes.UPDATE_REMINDER:
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
    case actionTypes.DELETE_REMINDER:
      return {
        ...state,
        reminders: state.reminders.filter((r) => r.id !== action.payload),
      };
    // Settings
    case actionTypes.SET_SETTINGS:
      return { ...state, settings: action.payload };
    case actionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    // Families
    case actionTypes.SET_FAMILIES:
      return { ...state, families: action.payload };
    case actionTypes.ADD_FAMILY:
      return {
        ...state,
        families: [...state.families, action.payload],
      };
    case actionTypes.UPDATE_FAMILY:
      return {
        ...state,
        families: state.families.map((f) =>
          f.id === action.payload.id ? action.payload : f
        ),
      };
    case actionTypes.DELETE_FAMILY:
      return {
        ...state,
        families: state.families.filter((f) => f.id !== action.payload),
      };
    // Clear
    case actionTypes.CLEAR_ALL:
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  // Track which reminders have already been alerted (by id) to avoid duplicates
  const alertedRemindersRef = useRef(new Set());

  // Load all data on mount & when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      loadAllData();
    });
    return unsubscribe;
  }, []);

  const loadAllData = async () => {
    try {
      // Auto-clean old records (keep last 30 days)
      await Storage.cleanOldRecords(30);

      const [pets, healthRecords, activities, reminders, families, settings] =
        await Promise.all([
          Storage.getPets(),
          Storage.getHealthRecords(),
          Storage.getActivities(),
          Storage.getReminders(),
          Storage.getFamilies(),
          Storage.getSettings(),
        ]);

      // Deduplicate items by id to avoid duplicate React keys
      const uniqueById = (arr) => {
        if (!Array.isArray(arr)) return [];
        const map = new Map();
        for (const item of arr) {
          if (!item) continue;
          const id = item.id || item._id || JSON.stringify(item);
          if (map.has(id)) {
            console.warn('Duplicate item id detected and skipped:', id);
            continue;
          }
          map.set(id, item);
        }
        return Array.from(map.values());
      };

      const dedupedPets = uniqueById(pets);
      const dedupedHealth = uniqueById(healthRecords);
      const dedupedActivities = uniqueById(activities);
      const dedupedReminders = uniqueById(reminders);
      const dedupedFamilies = uniqueById(families);

      console.log('Firestore同步测试:');
      console.log('pets:', dedupedPets);
      console.log('healthRecords:', dedupedHealth);
      console.log('activities:', dedupedActivities);
      console.log('reminders:', dedupedReminders);
      console.log('families:', dedupedFamilies);
      console.log('settings:', settings);

      dispatch({
        type: actionTypes.LOAD_ALL_DATA,
        payload: { pets: dedupedPets, healthRecords: dedupedHealth, activities: dedupedActivities, reminders: dedupedReminders, families: dedupedFamilies, settings },
      });

      // Auto-deactivate expired one-time reminders
      if (reminders && reminders.length > 0) {
        const now = new Date();
        for (const reminder of reminders) {
          if (
            reminder.isActive !== false &&
            reminder.frequency === 'once' &&
            new Date(reminder.dateTime) <= now
          ) {
            const updated = { ...reminder, isActive: false };
            await Storage.updateReminder(updated);
            dispatch({ type: actionTypes.UPDATE_REMINDER, payload: updated });
          }
        }
      }

      // Reschedule all active notifications on app start
      if (reminders && reminders.length > 0 && pets) {
        rescheduleAllReminders(reminders, pets);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // If Firestore permission error, give clearer hint
      if (error && error.code === 'permission-denied') {
        Alert.alert(
          '权限错误',
          '无法从 Firestore 读取数据：缺少权限。请在 Firebase 控制台检查 Firestore 规则，临时可以将规则设置为 allow read, write: if true 用于测试，或确保规则允许已登录用户访问（request.auth != null）。'
        );
      }
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  // ── In-app reminder checker (Expo Go fallback) ──
  // Since Expo Go doesn't support push notifications in SDK 53+,
  // we poll every 30s while the app is in the foreground and show
  // an Alert when a reminder's time has arrived.
  const getReminderTypeEmoji = useCallback((type) => {
    const emojis = {
      feeding: '🐟', play: '🧶', medicine: '💊', vet: '🏥',
      grooming: '🪮', vaccination: '💉', litter: '🚽', deworming: '🐛', other: '📝',
    };
    return emojis[type] || '🔔';
  }, []);

  const getReminderTypeLabel = useCallback((type) => {
    const labels = {
      feeding: '喂食', play: '玩耍', medicine: '吃药', vet: '看医生',
      grooming: '梳毛', vaccination: '疫苗', litter: '铲屎', deworming: '驱虫', other: '其他',
    };
    return labels[type] || '提醒';
  }, []);

  const checkDueReminders = useCallback(() => {
    if (!isExpoGo) return; // Native notifications handle this in dev builds
    if (!state.settings?.notificationsEnabled) return; // Respect user setting
    const now = new Date();
    const { reminders, pets } = state;

    for (const reminder of reminders) {
      if (reminder.isActive === false) continue;

      const reminderDate = new Date(reminder.dateTime);
      const alertKey = `${reminder.id}`;

      // 检查一次性提醒是否已过期（过去的任意时间），如果已过期则标记为不活跃
      if (reminder.frequency === 'once' && reminderDate < now) {
         // 我们在这里不仅触发提醒（如果在2分钟内），而且如果已经过了很久，我们也应该关闭它
         const diffMs = now.getTime() - reminderDate.getTime();
         
         // 如果超出了提醒窗口（比如超过2分钟），直接关闭它但不弹窗
         if (diffMs > 120000) {
            const updated = { ...reminder, isActive: false };
            (async () => {
              try {
                await Storage.updateReminder(updated);
                dispatch({ type: actionTypes.UPDATE_REMINDER, payload: updated });
                console.log('Auto-deactivated expired reminder silently:', updated.id);
              } catch (e) {
                console.error('Failed to auto-deactivate reminder:', e, updated.id);
              }
            })();
            continue; // 跳过后续的弹窗逻辑
         }
      }

      // For one-time reminders: check if it's due (within the last 2 minutes)
      // For repeating reminders: check if current time matches hour:minute (within 2 min window)
      let isDue = false;

      if (reminder.frequency === 'once') {
        const diffMs = now.getTime() - reminderDate.getTime();
        isDue = diffMs >= 0 && diffMs < 120000; // within 2 minutes
      } else {
        // For repeating reminders, check if current hour:minute matches
        const targetHour = reminderDate.getHours();
        const targetMinute = reminderDate.getMinutes();
        const nowHour = now.getHours();
        const nowMinute = now.getMinutes();

        const nowTotalMins = nowHour * 60 + nowMinute;
        const targetTotalMins = targetHour * 60 + targetMinute;
        const diffMins = nowTotalMins - targetTotalMins;

        if (diffMins >= 0 && diffMins < 2) {
          if (reminder.frequency === 'daily') {
            isDue = true;
          } else if (reminder.frequency === 'weekly') {
            isDue = now.getDay() === reminderDate.getDay();
          } else if (reminder.frequency === 'monthly') {
            isDue = now.getDate() === reminderDate.getDate();
          } else if (reminder.frequency === 'yearly') {
            isDue = now.getDate() === reminderDate.getDate() && now.getMonth() === reminderDate.getMonth();
          }
        }
      }

      // Use a date-stamped key so repeating reminders can fire again next time
      const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
      const uniqueAlertKey = `${alertKey}-${dateKey}`;

      if (isDue && !alertedRemindersRef.current.has(uniqueAlertKey)) {
        alertedRemindersRef.current.add(uniqueAlertKey);
        const pet = pets.find((p) => p.id === reminder.petId);
        const emoji = getReminderTypeEmoji(reminder.type);
        const typeLabel = getReminderTypeLabel(reminder.type);

        Alert.alert(
          `${emoji} ${reminder.title}`,
          `${pet?.name || '猫咪'}的${typeLabel}时间到啦！${reminder.notes ? '\n' + reminder.notes : ''}`,
          [{ text: '知道了', style: 'default' }]
        );

        // Auto-deactivate one-time reminders after they fire
        if (reminder.frequency === 'once') {
          const updated = { ...reminder, isActive: false };
          (async () => {
            try {
              const res = await Storage.updateReminder(updated);
              // If Storage.updateReminder for Firestore returns boolean or id, handle both
              console.log('Auto-deactivate reminder result:', res);
              dispatch({ type: actionTypes.UPDATE_REMINDER, payload: updated });
            } catch (e) {
              console.error('Failed to auto-deactivate reminder:', e, updated.id);
            }
          })();
        }
      }
    }

    // Clean up old alert keys (keep set from growing indefinitely)
    if (alertedRemindersRef.current.size > 200) {
      alertedRemindersRef.current.clear();
    }
  }, [state, getReminderTypeEmoji, getReminderTypeLabel]);

  useEffect(() => {
    if (!isExpoGo || state.isLoading) return;

    // Check immediately on load
    checkDueReminders();

    // Poll every 30 seconds
    const interval = setInterval(checkDueReminders, 30000);

    // Also check when app comes back to foreground
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkDueReminders();
        // Also sweep expired one-time reminders when app becomes active
        (async () => {
          try {
            const now = new Date();
            const remindersList = await Storage.getReminders();
            for (const r of remindersList || []) {
              if (r.frequency === 'once' && r.isActive !== false && new Date(r.dateTime) <= now) {
                const updated = { ...r, isActive: false };
                try {
                  await Storage.updateReminder(updated);
                  dispatch({ type: actionTypes.UPDATE_REMINDER, payload: updated });
                  console.log('Swept and deactivated expired reminder on foreground:', updated.id);
                } catch (e) {
                  console.error('Error sweeping expired reminder:', e, updated.id);
                }
              }
            }
          } catch (e) {
            console.error('Error during sweep on foreground:', e);
          }
        })();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [checkDueReminders, state.isLoading]);

  // Pet actions
  const addPet = async (pet) => {
    let photoUrl = pet.photo;
    if (pet.photo && pet.photo.startsWith('file://')) {
      const path = `pets/${pet.id}/photo_${Date.now()}.jpg`;
      photoUrl = await Storage.uploadImage(pet.photo, path);
    }
    
    const petToSave = { ...pet, photo: photoUrl };
    const id = await Storage.addPet(petToSave);
    const petWithId = { ...petToSave, id };
    dispatch({ type: actionTypes.ADD_PET, payload: petWithId });
  };

  const updatePet = async (pet) => {
    let photoUrl = pet.photo;
    if (pet.photo && pet.photo.startsWith('file://')) {
      const path = `pets/${pet.id}/photo_${Date.now()}.jpg`;
      photoUrl = await Storage.uploadImage(pet.photo, path);
    }

    // Also handle gallery photos if they are local
    const updatedPhotos = await Promise.all((pet.photos || []).map(async (p) => {
      if (p.uri && p.uri.startsWith('file://')) {
        const path = `pets/${pet.id}/gallery/${p.id}.jpg`;
        const uri = await Storage.uploadImage(p.uri, path);
        return { ...p, uri };
      }
      return p;
    }));

    // Handle memorial photos if they are local
    const updatedMemorialPhotos = await Promise.all((pet.memorialPhotos || []).map(async (p) => {
      if (p.uri && p.uri.startsWith('file://')) {
        const path = `pets/${pet.id}/memorial/${p.id}.jpg`;
        const uri = await Storage.uploadImage(p.uri, path);
        return { ...p, uri };
      }
      return p;
    }));

    const petToUpdate = { 
      ...pet, 
      photo: photoUrl, 
      photos: updatedPhotos,
      memorialPhotos: updatedMemorialPhotos 
    };
    await Storage.updatePet(petToUpdate);
    dispatch({ type: actionTypes.UPDATE_PET, payload: petToUpdate });
  };

  const removePet = async (petId) => {
    await Storage.deletePet(petId);
    dispatch({ type: actionTypes.DELETE_PET, payload: petId });
  };

  const selectPet = (pet) => {
    dispatch({ type: actionTypes.SELECT_PET, payload: pet });
  };

  // Health Record actions
  const addHealthRecord = async (record) => {
    const id = await Storage.addHealthRecord(record);
    const recWithId = { ...record, id };
    dispatch({ type: actionTypes.ADD_HEALTH_RECORD, payload: recWithId });
  };

  const updateHealthRecord = async (record) => {
    await Storage.updateHealthRecord(record);
    dispatch({ type: actionTypes.UPDATE_HEALTH_RECORD, payload: record });
  };

  const removeHealthRecord = async (recordId) => {
    await Storage.deleteHealthRecord(recordId);
    dispatch({ type: actionTypes.DELETE_HEALTH_RECORD, payload: recordId });
  };

  // Activity actions
  const addActivityRecord = async (activity) => {
    const id = await Storage.addActivity(activity);
    const activityWithId = { ...activity, id };
    dispatch({ type: actionTypes.ADD_ACTIVITY, payload: activityWithId });
  };

  const updateActivityRecord = async (activity) => {
    await Storage.updateActivity(activity);
    dispatch({ type: actionTypes.UPDATE_ACTIVITY, payload: activity });
  };

  const removeActivity = async (activityId) => {
    await Storage.deleteActivity(activityId);
    dispatch({ type: actionTypes.DELETE_ACTIVITY, payload: activityId });
  };

  // Reminder actions
  const addReminderRecord = async (reminder) => {
    const id = await Storage.addReminder(reminder);
    const reminderWithId = { ...reminder, id };
    dispatch({ type: actionTypes.ADD_REMINDER, payload: reminderWithId });
    // Schedule device notification
    if (reminderWithId.isActive !== false && state.settings?.notificationsEnabled !== false) {
      const pet = state.pets.find((p) => p.id === reminder.petId);
      await scheduleReminderNotification(reminderWithId, pet?.name);
    }
  };

  const updateReminder = async (reminder) => {
    await Storage.updateReminder(reminder);
    dispatch({ type: actionTypes.UPDATE_REMINDER, payload: reminder });
    // Update device notification
    if (reminder.isActive !== false && state.settings?.notificationsEnabled !== false) {
      const pet = state.pets.find((p) => p.id === reminder.petId);
      await scheduleReminderNotification(reminder, pet?.name);
    } else {
      await cancelReminderNotification(reminder.id);
    }
  };

  const removeReminder = async (reminderId) => {
    await cancelReminderNotification(reminderId);
    await Storage.deleteReminder(reminderId);
    dispatch({ type: actionTypes.DELETE_REMINDER, payload: reminderId });
  };

  // Settings actions
  const updateSettings = async (newSettings) => {
    const updated = { ...state.settings, ...newSettings };
    await Storage.saveSettings(updated);
    dispatch({ type: actionTypes.UPDATE_SETTINGS, payload: newSettings });

    // Handle notifications toggle
    if ('notificationsEnabled' in newSettings) {
      if (newSettings.notificationsEnabled) {
        // Request permission then reschedule all active reminders
        const granted = await requestNotificationPermissions();
        if (granted) {
          await rescheduleAllReminders(state.reminders, state.pets);
        }
      } else {
        // Cancel all scheduled notifications
        await cancelAllNotifications();
      }
    }
  };

  // Family actions
  const addFamily = async (family) => {
    const id = await Storage.addFamily(family);
    const familyWithId = { ...family, id };
    dispatch({ type: actionTypes.ADD_FAMILY, payload: familyWithId });
  };

  const updateFamily = async (family) => {
    await Storage.updateFamily(family);
    dispatch({ type: actionTypes.UPDATE_FAMILY, payload: family });
  };

  const removeFamily = async (familyId) => {
    await Storage.deleteFamily(familyId);
    dispatch({ type: actionTypes.DELETE_FAMILY, payload: familyId });
  };

  // Clear all
  const clearAll = async () => {
    await Storage.clearAllData();
    dispatch({ type: actionTypes.CLEAR_ALL });
  };

  const value = {
    ...state,
    addPet,
    updatePet,
    removePet,
    selectPet,
    addHealthRecord,
    updateHealthRecord,
    removeHealthRecord,
    addActivityRecord,
    updateActivityRecord,
    removeActivity,
    addReminderRecord,
    updateReminder,
    removeReminder,
    updateSettings,
    addFamily,
    updateFamily,
    removeFamily,
    clearAll,
    refreshData: loadAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useTheme = () => {
  const { settings } = useApp();
  const theme = useMemo(
    () => (settings.darkMode ? DarkTheme : LightTheme),
    [settings.darkMode]
  );
  return theme;
};

export default AppContext;
