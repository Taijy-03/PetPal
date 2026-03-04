import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as Storage from '../utils/storage';

const AppContext = createContext();

const initialState = {
  pets: [],
  healthRecords: [],
  activities: [],
  reminders: [],
  settings: {
    darkMode: false,
    notificationsEnabled: true,
    defaultPetType: 'dog',
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

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
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
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

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

  const removeActivity = async (activityId) => {
    await Storage.deleteActivity(activityId);
    dispatch({ type: actionTypes.DELETE_ACTIVITY, payload: activityId });
  };

  // Reminder actions
  const addReminderRecord = async (reminder) => {
    await Storage.addReminder(reminder);
    dispatch({ type: actionTypes.ADD_REMINDER, payload: reminder });
  };

  const updateReminder = async (reminder) => {
    await Storage.updateReminder(reminder);
    dispatch({ type: actionTypes.UPDATE_REMINDER, payload: reminder });
  };

  const removeReminder = async (reminderId) => {
    await Storage.deleteReminder(reminderId);
    dispatch({ type: actionTypes.DELETE_REMINDER, payload: reminderId });
  };

  // Settings actions
  const updateSettings = async (newSettings) => {
    const updated = { ...state.settings, ...newSettings };
    await Storage.saveSettings(updated);
    dispatch({ type: actionTypes.UPDATE_SETTINGS, payload: newSettings });
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

export default AppContext;
