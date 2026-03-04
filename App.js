import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useTheme } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import {
  setupNotificationHandler,
  setupNotificationChannel,
} from './src/utils/notifications';

// Initialize notification handler at module level (before any component renders)
setupNotificationHandler();

function AppContent() {
  const theme = useTheme();

  useEffect(() => {
    // Set up Android notification channel
    setupNotificationChannel();
  }, []);

  return (
    <>
      <StatusBar style={theme.dark ? 'light' : 'dark'} translucent />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
