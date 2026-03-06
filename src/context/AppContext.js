import React, { createContext, useContext, useReducer, useEffect, useMemo, useRef, useCallback } from 'react';
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

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Auto-clean old records (keep last 30 days)
      await Storage.cleanOldRecords(30);

      const [pets, healthRecords, activities, reminders, settings] =
        await Promise.all([
          Storage.getPets(),
          Storage.getHealthRecords(),
          Storage.getActivities(),
          Storage.getReminders(),
          Storage.getSettings(),
        ]);
      dispatch({
        type: actionTypes.LOAD_ALL_DATA,
        payload: { pets, healthRecords, activities, reminders, settings },
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
          Storage.updateReminder(updated);
          dispatch({ type: actionTypes.UPDATE_REMINDER, payload: updated });
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
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [checkDueReminders, state.isLoading]);

  // Pet actions
  const addPet = async (pet) => {
    await Storage.addPet(pet);
    dispatch({ type: actionTypes.ADD_PET, payload: pet });
  };

  const updatePet = async (pet) => {
    await Storage.updatePet(pet);
    dispatch({ type: actionTypes.UPDATE_PET, payload: pet });
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
    await Storage.addHealthRecord(record);
    dispatch({ type: actionTypes.ADD_HEALTH_RECORD, payload: record });
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
    await Storage.addActivity(activity);
    dispatch({ type: actionTypes.ADD_ACTIVITY, payload: activity });
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
    await Storage.addReminder(reminder);
    dispatch({ type: actionTypes.ADD_REMINDER, payload: reminder });
    // Schedule device notification
    if (reminder.isActive !== false && state.settings?.notificationsEnabled !== false) {
      const pet = state.pets.find((p) => p.id === reminder.petId);
      await scheduleReminderNotification(reminder, pet?.name);
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
